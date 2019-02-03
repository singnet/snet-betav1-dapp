import * as React from 'react';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import { CloudUpload } from '@material-ui/icons';
import { Typography } from '@material-ui/core';
import fileSize from 'filesize';

export default class ImageUploader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const dropZoneProps = {
            name: 'image',
            multiple: false,
            onDrop: files => {
                const file = files[0];
                this.props.handleImageUpload(file);
            }
        };

        return (
            <Dropzone {...dropZoneProps} style={{ marginBottom: '15px' }} accept="image/jpeg, image/png">
                {({ getRootProps, getInputProps, isDragActive }) => {
                    return (
                        <div
                            {...getRootProps()}
                            className={classNames('dropzone', {
                                'dropzone--isActive': isDragActive
                            })}
                            style={{
                                textAlign: 'center',
                                padding: '30px',
                                border: 'dashed 1px #90D4FF'
                            }}
                        >
                            <input {...getInputProps()} />
                            {this.props.preview ? (
                                <img src={this.props.preview} style={{ width: '128px' }} />
                            ) : (
                                <CloudUpload style={{ fontSize: '48px' }} />
                            )}
                            {this.props.uploadedFile && (
                                <React.Fragment>
                                    <Typography variant={'h5'}>
                                        {this.props.uploadedFile.name}
                                    </Typography>
                                    <Typography variant={'body1'}>
                                        {fileSize(this.props.uploadedFile.size)}
                                    </Typography>
                                </React.Fragment>
                            )}
                            {!this.props.uploadedFile &&
                            (isDragActive ? (
                                <Typography variant="h4">Drop file here...</Typography>
                            ) : (
                                <Typography variant="body1">
                                    The file needs to be a valid either jpg/png file.
                                </Typography>
                            ))}
                        </div>
                    );
                }}
            </Dropzone>
        );
    }
}
