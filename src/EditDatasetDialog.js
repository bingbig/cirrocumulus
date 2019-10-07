import {CircularProgress} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import React from 'react';
import {connect} from 'react-redux';
import {API, EDIT_DATASET_DIALOG, getIdToken, saveDataset, setDialog, setMessage} from './actions';

class EditDatasetDialog extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            url: '',
            datasetName: this.props.dataset != null ? this.props.dataset.name : '',
            readers: '',
            loading: this.props.dataset != null,
        };
    }

    componentDidMount() {
        if (this.props.dataset != null) {
            fetch(API + '/dataset?id=' + this.props.dataset.id,
                {
                    method: 'GET',
                    headers: {'Authorization': 'Bearer ' + getIdToken()},
                }).then(result => result.json()).then(datasetInfo => {
                let readers = [];
                for (let email in datasetInfo.roles) {
                    if (datasetInfo[email] === 'reader') {
                        readers.push(email);
                    }
                }

                this.setState({
                    datasetName: datasetInfo.name,
                    loading: false,
                    url: datasetInfo.url,
                    readers: readers.join(', '),
                });
            }).catch(err => {
                this.props.handleError('Unable to retrieve dataset details. Please try again.');
                this.props.handleCancel();
            });
        }
    }

    handleClose = () => {
        this.props.handleCancel();
    };

    handleSave = () => {
        let datasetName = this.state.datasetName.trim();
        let url = this.state.url.trim();
        if (datasetName === '' || url === '') {
            return;
        }
        this.setState({loading: true});
        let tokens = this.state.readers.split(',');

        let uniqueReaders = new Set();
        for (let i = 0; i < tokens.length; i++) {
            let reader = tokens[i].trim().toLowerCase();
            if (reader !== '') {
                uniqueReaders.add(reader);
            }
        }
        let readers = Array.from(uniqueReaders);
        this.props.handleSave({dataset: this.props.dataset, name: datasetName, url: url, readers: readers});
    };

    onEmailChanged = (event) => {
        this.setState({readers: event.target.value});
    };
    onUrlChanged = (event) => {
        this.setState({url: event.target.value});
    };
    onDatasetNameChanged = (event) => {
        this.setState({datasetName: event.target.value});
    };

    render() {
        return (
            <Dialog
                open={true}
                onClose={this.handleClose}
                aria-labelledby="edit-dataset-dialog-title"
                fullWidth={true}
                maxWidth={'sm'}
            >
                <DialogTitle id="edit-dataset-dialog-title">{this.props.dataset == null
                    ? 'Import'
                    : 'Edit'} Dataset</DialogTitle>
                <DialogContent>
                    {this.state.loading && <CircularProgress/>}
                    <TextField
                        disabled={this.state.loading}
                        required={true}
                        value={this.state.datasetName}
                        onChange={this.onDatasetNameChanged}
                        margin="dense"
                        label="Dataset name"
                        fullWidth
                    />

                    {!this.state.loading &&
                    <TextField
                        required={true}
                        value={this.state.url}
                        onChange={this.onUrlChanged}
                        margin="dense"
                        helperText={"Please ensure that " + this.props.serverEmail + " has \"Storage Object Viewer\" permissions"}
                        label="Dataset URL (e.g. gs://my_bucket/my_dataset.parquet)"
                        fullWidth
                    />}

                    {!this.state.loading &&
                    <TextField
                        value={this.state.readers}
                        onChange={this.onEmailChanged}
                        margin="dense"
                        label="Comma separated list of emails to share with"
                        fullWidth
                        multiline
                    />}
                </DialogContent>
                <DialogActions>
                    <Button disabled={this.state.loading} onClick={this.handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button disabled={this.state.loading} onClick={this.handleSave} color="primary">
                        Save
                    </Button>
                </DialogActions>


            </Dialog>
        );
    }
}

const mapStateToProps = state => {
    return {
        dataset: state.dialog === EDIT_DATASET_DIALOG ? state.dataset : null,
        serverEmail: state.serverInfo.email
    };
};
const mapDispatchToProps = dispatch => {
    return {
        handleSave: value => {
            dispatch(saveDataset(value));
        },
        handleCancel: value => {
            dispatch(setDialog(null));
        },
        handleError: value => {
            dispatch(setMessage(value));
        },

    };
};

export default (connect(
    mapStateToProps, mapDispatchToProps,
)(EditDatasetDialog));
