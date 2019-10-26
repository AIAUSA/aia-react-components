import React from 'react';
import MaskedInput from 'react-maskedinput'

import { Row, Container,Button, Form, FormGroup, Label, Input, Col } from 'reactstrap';
import { stat } from 'fs';
import { InvoiceList } from '../../Invoices';
import * as APPSETTINGS from '../../../constants/app.js';
import FormFeedback from '../form-feedback';

class CreditCardForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            card: {
                name: '',
                lname: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                zip: '',
                phone: '',
                amount: '',
                card: '',
                expMonth: '',
                expYear: '',
                cvc: ''
            },
            FormErrors: {
                name: '',
                address1: '',
                card: '',
                exp: '',
                state: '',
                zip: '',
                city: '',
                phone: '',
                cvc: '',
                expMonth: '',
                expYear: '',
                cardResponse: ''
            },
            formValid: false,
            nameValid: false,
            address1Valid: false,
            cardValid: false,
            expMonthValid: false,
            expYearValid: false,
            stateValid: false,
            zipValid: false,
            cityValid: false,
            phoneValid: false,
            cvcValid: false,
            lnameValid: false,
            nounce: '',
            formChanged: false
         }
    }

    componentDidMount() {
        const script = document.createElement("script");

        //script.src = "//js.authorize.net/v1/Accept.js";
        script.src = "https://js.authorize.net/v1/Accept.js";
        script.async = true;

        document.body.appendChild(script);
    }

    onChange = event => {
        var Card = { ...this.state.card };
        Card[event.target.name] = event.target.value;
        this.setState({ card: Card }, this.validateField(event.target.name, event.target.value));
      };

    getAuthNetResponse = (callback) => {
        var secureData = {}; 
        var authData = {}; 
        var cardData = {};

        // Extract the card number, expiration date, and card code.
        cardData.cardNumber = this.state.card.card;
        cardData.month = this.state.card.expMonth;
        cardData.year = this.state.card.expYear;
        cardData.cardCode = this.state.card.cvc;
        //cardData.zip = $scope.reg.CCZip;
        //cardData.fullName = $scope.reg.CCFirstName + ' ' + $scope.reg.CCLastName;
        secureData.cardData = cardData;

        // The Authorize.Net Client Key is used in place of the traditional Transaction Key. The Transaction Key
        // is a shared secret and must never be exposed. The Client Key is a public key suitable for use where
        // someone outside the merchant might see it.
        authData.clientKey = "8p6Dj92dWKgyVRJzZPnWDtha3s5jfnGdCu4Nb2H9gdW8NW3PXV7Hz4866E4zr6da";
        authData.apiLoginID = "22x2sYTBj";
        //authData.apiLoginID = $scope.reg.CCLogin;
        secureData.authData = authData;

        //console.log(secureData);
        // Pass the card number and expiration date to Accept.js for submission to Authorize.Net.
        Accept.dispatchData(secureData, function(response) { callback(response) });
    }

    processAuthNetResponse = (response) => {
        const that = this;
        let FormErrors = this.state.FormErrors;
        let nounce = this.state.nounce;               
        
        if (response.messages.resultCode === "Error") {
            return "Error";
        } else {
            //submit to api
            var data = { 
                nounce: response.opaqueData.dataValue,
                FirstName: this.state.card.name, 
                LastName: this.state.card.lname,
                amount: this.props.amount/100,
                description: "Prayer Letter Service Fees",
                chartfield: APPSETTINGS.CHARTFIELD
            };

            fetch(APPSETTINGS.API + "/payment/ccpayment", 
            {
                method: 'POST', // or 'PUT'
                body: JSON.stringify(data), // data can be `string` or {object}!
                headers: {
                  'Content-Type': 'application/json'
                }
            })
            .then(Response => Response.json())
                .then(function(data) {
                    //handle Response
                    if (data["status"] === "success") {
                        //return to parent
                        that.props.process(data["authCode"]);
                    } else {
                        FormErrors.cardResponse = data["message"];
                        that.setState({FormErrors: FormErrors});
                    }

                    return null;
                });
            return null;
        }
    }

    submit = event => {
        //submit to anet
        this.getAuthNetResponse(this.processAuthNetResponse);
    }

    validateField(field, value) {
        let FormErrors = this.state.FormErrors;
        let nameValid = this.state.nameValid;
        let address1Valid = this.state.address1Valid;
        let cardValid = this.state.cardValid;
        let expMonthValid = this.state.expMonthValid;
        let expYearValid = this.state.expYearValid;
        let stateValid = this.state.state;
        let zipValid = this.state.zipValid;
        let cityValid = this.state.cityValid;
        let phoneValid = this.state.phoneValid;
        let cvcValid = this.state.cvcValid;
        let lnameValid = this.state.lnameValid

        let change = false;

        switch(field) {
            case 'name':
                nameValid = value.length >= 4;
                FormErrors.name = nameValid ? '' : 'Name is too short';
                if (!nameValid) { change = true; }
                break;
            case 'lname':
                lnameValid = value.length >= 4;
                FormErrors.name = nameValid ? '' : 'Name is too short';
                if (!lnameValid) { change = true; }
                break;
            case 'address1':
                address1Valid = value.length >= 4;
                FormErrors.address1 = address1Valid ? '' : 'Address too short';
                if (!address1Valid) { change = true; }
                break;
            case 'card':
                cardValid = value.length >= 16 && !isNaN(value);
                FormErrors.card = cardValid ? '' : 'Card Number is Invalid';
                if (!cardValid) { change = true; }
                break;
            case 'expMonth':
                expMonthValid = value.length === 2 && !isNaN(value) && value > 0 && value < 13;
                FormErrors.expMonth = expMonthValid ? '' : 'Exp Month is Invalid';
                if (!expMonthValid) { change = true; }
                break;
            case 'expYear':
                expYearValid = value.length === 4 && !isNaN(value) && value > 2018 && value < 2030;
                FormErrors.expYear = expYearValid ? '' : 'Exp Year is Invalid';
                if (!expYearValid) { change = true; }
                break;
            case 'state':
                stateValid = value.length >= 2;
                FormErrors.state = stateValid ? '' : 'State is Invalid';
                if (!stateValid) { change = true; }
                break;
            case 'city':
                cityValid = value.length >= 1;
                FormErrors.city = cityValid ? '' : 'City is Invalid';
                if (!cityValid) { change = true; }
                break;
            case 'zip':
                zipValid = value.length >= 5;
                FormErrors.zip = zipValid ? '' : 'Zip Code is Invalid';
                if (!zipValid) { change = true; }
                break;
            case 'phone':
                phoneValid = value.length >= 7;
                FormErrors.phone = phoneValid ? '' : 'Phone is Invalid';
                if (!phoneValid) { change = true; }
                break;
            case 'cvc':
                cvcValid = value.length > 2 && !isNaN(value);
                FormErrors.cvc = cvcValid ? '' : 'CVC is Invalid';
                if (!cvcValid) { change = true; }
            default:
                break;
        }

        this.setState({
            FormErrors: FormErrors,
            nameValid: nameValid,
            address1Valid: address1Valid,
            cardValid: cardValid,
            expMonthValid: expMonthValid,
            expYearValid: expYearValid,
            stateValid: stateValid,
            zipValid: zipValid,
            cityValid: cityValid,
            phoneValid: phoneValid,
            cvcValid: cvcValid,
            lnameValid: lnameValid,
            formChanged: change
        }, this.validateForm);
    }

    validateForm() {
        var valid = this.state.nameValid && this.state.phoneValid && this.state.lnameValid && this.state.cardValid && this.state.expYearValid && this.state.expMonthValid && this.state.cvcValid;
        this.setState({formValid: valid });    
    }

    render() { 
        return ( 
            <Container>
                <Form>
                    <FormGroup row>
                        <Label for="name" sm={2}>First Name</Label>
                        <Col sm={4}>
                            <Input type="text" name="name" id="name" value={this.state.card.name} onChange={this.onChange} valid={this.state.nameValid} />
                        </Col>
                        <Label for="lname" sm={2}>Last Name</Label>
                        <Col sm={4}>
                            <Input type="text" name="lname" id="name" value={this.state.card.lname} onChange={this.onChange} valid={this.state.lnameValid} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="card" sm={2}>Card #</Label>
                        <Col sm={4}>
                            <Input type="text" name="card" id="card" value={this.state.card.card} onChange={this.onChange} valid={this.state.cardValid} placeholder="9999999999999999" />
                        </Col>
                        <Label for="exp" sm={2}>CVC</Label>
                        <Col sm={4}>
                            <Input type="text" className="form-control" name="cvc" id="cvc" value={this.state.card.cvc} onChange={this.onChange} valid={this.state.cvcValid} placeholder="999" />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="expMonth" sm={2}>Expiration Month</Label>
                        <Col sm={4}>
                            <Input type="text" className="form-control" name="expMonth" id="expMonth" value={this.state.card.expMonth} onChange={this.onChange} valid={this.state.expMonthValid} placeholder="99" />
                        </Col>
                        <Label for="expYear" sm={2}>Expiration Year</Label>
                        <Col sm={4}>
                            <Input type="text" className="form-control" name="expYear" id="expYear" value={this.state.card.expYear} onChange={this.onChange} valid={this.state.expYearValid} placeholder="9999" />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="address1" sm={2}>Address 1</Label>
                        <Col sm={4}>
                            <Input type="text" name="address1" id="address1" value={this.state.card.address1} onChange={this.onChange} valid={this.state.address1Valid} />
                        </Col>
                        <Label for="address2" sm={2}>Address2</Label>
                        <Col sm={4}>
                            <Input type="text" name="address2" id="address2" value={this.state.card.address2} onChange={this.onChange} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="city" sm={2}>City</Label>
                        <Col sm={4}>
                            <Input type="text" name="city" id="city" value={this.state.card.city} onChange={this.onChange} valid={this.state.cityValid} />
                        </Col>
                        <Label for="state" sm={2}>State</Label>
                        <Col sm={4}>
                            <Input type="text" name="state" id="state" value={this.state.card.state} onChange={this.onChange} valid={this.state.stateValid} />
                        </Col>
                        <Label for="zip" sm={2}>Zip</Label>
                        <Col sm={4}>
                            <Input type="text" name="zip" id="zip" value={this.state.card.zip} onChange={this.onChange} valid={this.state.zipValid} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="phone" sm={2}>Phone</Label>
                        <Col sm={4}>
                            <Input className="form-control" type="text" name="phone" id="phone" value={this.state.card.phone} onChange={this.onChange} valid={this.state.phoneValid} placeholder="(999) 999-9999" />
                        </Col>
                        <Label for="amount" sm={2}>Amount</Label>
                        <Col sm={4}>
                            <Input type="text" name="amount" id="amount" value={this.props.amount/100} onChange={this.onChange} valid={this.state.amountValid} disabled />
                        </Col>
                    </FormGroup>
                    { !this.state.formValid && this.state.formChanged && 
                            <FormFeedback status="danger" errors={this.state.FormErrors} />
                    }
                    <FormGroup check row>
                        <Col sm={{ size: 10 }}>
                            <Button onClick={this.submit} disabled={!this.state.formValid} color="primary">Submit</Button>
                        </Col>
                    </FormGroup>
                </Form>
            </Container>
         );
    }
}
 
export default CreditCardForm;