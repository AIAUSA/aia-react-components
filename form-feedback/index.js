import React, { Component } from 'react';
import { Row, Alert } from 'reactstrap';

class FormFeedback extends Component {
    constructor(props) {
        super(props);
        this.state = { status: '', errors: [], message: '' }
    }

    
    render() { 
        var hasErrors = false;
        Object.keys(this.props.errors).forEach(p => { if(this.props.errors[p].length > 0) { hasErrors = true; }});
        return ( 
            <Row>
                { hasErrors && this.props.status != '' &&
                    <Alert color={this.props.status} className="mt-3">
                        <h6>The following issues exist before this can be submitted: </h6>
                        { Object.keys(this.props.errors).map((fieldName, i) => {
                                    if (this.props.errors[fieldName] > '') {
                                        return (
                                            <p key={i}>{this.props.errors[fieldName]} </p>
                                        )
                                    }
                                })
                        }
                    </Alert>
                }
            </Row> 
        );
    }
}
 
export default FormFeedback;