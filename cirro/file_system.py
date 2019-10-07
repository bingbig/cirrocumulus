from urllib.parse import urlparse

import fsspec


class FileSystem:

    def __init__(self):
        # scheme can be gs, file, etc.
        self.scheme_to_fs = {}

    def get_fs(self, path):
        pr = urlparse(path)
        fs = self.scheme_to_fs.get(pr.scheme, None)
        if fs is not None:
            return fs
        fs = fsspec.filesystem(pr.scheme if not pr.scheme == '' else 'file')
        self.scheme_to_fs[pr.scheme] = fs
        return fs

    def open(self, path, mode='rb'):
        fs = self.get_fs(path)
        return fs.open(path, mode)