import json
import os
from abc import abstractmethod, ABC

import pandas as pd

from cirrocumulus.api import get_file_path


class AbstractDataset(ABC):

    def __init__(self, suffixes):
        super().__init__()
        self.suffixes = suffixes

    @abstractmethod
    def read_dataset(self, filesystem, path, keys, dataset):
        pass

    def get_result(self, filesystem, path, dataset, result_id):
        return get_file_path(os.path.join('uns', result_id + '.json.gz'), path)

    def get_dataset_info(self, filesystem, path):
        """Returns a dict with shape, var, modules
       """
        s = self.get_schema(filesystem, path)
        d = dict()
        d['var'] = pd.Index(s['var'])
        d['shape'] = s['shape']
        return d

    def get_suffixes(self):
        return self.suffixes

    def get_schema(self, filesystem, path):
        if path.endswith('.gz'):
            import gzip
            with gzip.open(filesystem.open(path)) as s:
                return json.load(s)
        else:
            with filesystem.open(path) as s:
                return json.load(s)
