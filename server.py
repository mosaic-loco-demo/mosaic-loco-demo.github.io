from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
from urllib.parse import unquote, urlsplit
import mimetypes
import re

ROOT = Path(__file__).resolve().parent
VIDEO_ROOT = (ROOT / "videos").resolve()


class RangeRequestHandler(SimpleHTTPRequestHandler):
    def translate_path(self, request_path):
        relative_path = unquote(urlsplit(request_path).path).lstrip("/")
        requested_path = (ROOT / relative_path).resolve()
        inside_project = requested_path.is_relative_to(ROOT)
        inside_video_archive = requested_path.is_relative_to(VIDEO_ROOT)
        if not inside_project and not inside_video_archive:
            return str(ROOT / "__not_found__")
        return str(requested_path)

    def send_head(self):
        path = Path(self.translate_path(self.path))
        if path.is_dir():
            path = path / "index.html"
        if not path.is_file():
            self.send_error(404, "File not found")
            return None

        file_size = path.stat().st_size
        content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        range_header = self.headers.get("Range")
        start = 0
        end = file_size - 1

        if range_header:
            match = re.fullmatch(r"bytes=(\d*)-(\d*)", range_header.strip())
            if not match or (not match.group(1) and not match.group(2)):
                return self.send_invalid_range(file_size)
            if match.group(1):
                start = int(match.group(1))
                if match.group(2):
                    end = int(match.group(2))
            else:
                suffix_length = int(match.group(2))
                if suffix_length <= 0:
                    return self.send_invalid_range(file_size)
                start = max(0, file_size - suffix_length)
            end = min(end, file_size - 1)
            if start >= file_size or start > end:
                return self.send_invalid_range(file_size)

        length = end - start + 1
        self.send_response(206 if range_header else 200)
        self.send_header("Content-Type", content_type)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(length))
        if range_header:
            self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
        self.end_headers()

        stream = path.open("rb")
        stream.seek(start)
        self._remaining_bytes = length
        return stream

    def send_invalid_range(self, file_size):
        self.send_response(416)
        self.send_header("Content-Range", f"bytes */{file_size}")
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        return None

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_remaining_bytes", None)
        if remaining is None:
            return super().copyfile(source, outputfile)
        while remaining:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    server = ThreadingHTTPServer(("127.0.0.1", port), RangeRequestHandler)
    print(f"Serving project page at http://127.0.0.1:{port}/")
    server.serve_forever()
