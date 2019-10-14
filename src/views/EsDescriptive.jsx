import React from "react";
import { MDBRow, MDBCol } from 'mdbreact';
import Stepper from 'react-stepper-horizontal';
import { TagInput } from '../components/reactjs-tag-input'
import InputRange from 'react-input-range';
import '../assets/css/all.css';
import '../assets/css/table.css';
import 'react-input-range/lib/css/index.css';
import { ComboBox } from '@progress/kendo-react-dropdowns';

import {
    Alert,
    Button,
    Badge,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Collapse,
    Container,
    Row,
    Col,
    FormGroup,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Input,
    ListGroup,
    ListGroupItem,
    Table,
} from "reactstrap";

import ReactTable from "react-table";
import "react-table/react-table.css";


class Descriptive extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            steps: [
                { title: '' },
                { title: '' },
                { title: '' },
                { title: '' }],
            data: [],
            tags: [],
            vet: [],
            collapse: false,
            message: this.props.location.state ? this.props.location.state.message : '',
            stepPosition: 0,
            btncolor: "primary",
            focused: "",
            PopAmost: "",
            Type: "",
            var: "",
            step: 1,
            value: 0,
            MedSep: "Percentil",
            cSelected: [],
            items: []
        };
        this.onTagsChanged = this.onTagsChanged.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
    };

    onRadioBtnClick(categ, rSelected) {
        if (categ === 'QntQuali') {
            this.setState({ rSelected });
        } else if (categ === 'PopAmost') {
            this.setState({
                PopAmost: rSelected
            });
        }
    }

    buttoncolor(categ, btn) {
        if (categ === 'QntQuali') {
            if (btn === this.state.rSelected) {
                return "primary"
            } else { return "secondary" }
        }
        else if (categ === 'PopAmost') {
            if (btn === this.state.PopAmost) {
                return "primary"
            } else { return "secondary" }
        }
    }

    SendArray = () => {
        let aux = [];
        for (let i = 0; i < this.state.tags.length; i++) {
            aux.push((this.state.tags[i].displayValue));
        }
        const requestInfo = {
            method: 'POST',
            body: JSON.stringify({
                "varPesq": this.state.Var,
                "data": aux,
                "subTypeMeasure": this.state.rSelected,
                "amost": this.state.PopAmost
            }),
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            }),
        };

        fetch('https://datatongji-backend.herokuapp.com/descriptive/simple_frequency', requestInfo)
            .then(response => {
                if (response.ok) {
                    this.setState({ message: '' });
                    return response.json();
                }
                throw new Error("Falha!");
            }).then(descriptive => {
                let desc = descriptive;
                this.setState({ Type: desc.typeVar });
                this.setState({ weightedMean: desc.weightedMean });
                this.setState({ median: desc.median });
                this.setState({ variance: desc.variance });
                this.setState({ deviation: desc.deviation });
                this.setState({ coefvar: desc.coefvar });
                this.setState({ percentile: desc.percentile });
                this.setState({ rSelected: desc.subType })
                if (desc.mode.length > 1) {
                    let m = desc.mode[0].Value;
                    for (let i = 1; i < desc.mode.length; i++) {
                        m = m + ' | ' + desc.mode[i].Value;
                    }
                    this.setState({ mode: m })
                } else {
                    this.setState({ mode: desc.mode[0].Value })
                }
                this.setState({ vet: desc.dataDescriptive });
            })
            .catch(e => {
                this.setState({ message: e.message });
            });
        // this.ResultCollapse();
    };

    renderTableHeader() {
        let header = Object.keys(
            { Variável: 'se', Fi: '2', Fac: 2, 'Fr%': '25.00', 'Fac%': '25.00' }
        )
        return header.map((key, index) => {
            return <th key={index}>{key}</th>
        })
    }

    renderTableData() {
        return this.state.vet.map((student, index) => {
            const { value, frequency, cumulativeFrequency, relativeFrequency, accumulatedPercentage } = student //destructuring
            return (
                <tr key={value}>
                    <td>{value}</td>
                    <td>{frequency}</td>
                    <td>{cumulativeFrequency}</td>
                    <td>{relativeFrequency + '%'}</td>
                    <td>{accumulatedPercentage + '%'}</td>
                </tr>
            )
        })
    }

    onTagsChanged(tags) {
        this.setState({ tags })
    };

    onChangeCB = (event) => {
        this.setState(
            { value: 0 })
        this.RangeStep(event);
    }

    RangeStep = (med) => {
        if (med === 'Quartil') {
            this.setState({
                MedSep: med,
                step: 25
            })
        }
        else if (med === 'Quintil') {
            this.setState({
                MedSep: med,
                step: 20
            })
        }
        else if (med === 'Decil') {
            this.setState({
                MedSep: med,
                step: 10
            })
        }
        else if (med === 'Percentil') {
            this.setState({
                MedSep: med,
                step: 1
            })
        }
    }

    PopAmost = e => {
        this.setState({
            PopAmost: e.target.value
        });
    };

    onFocus = () => {
        this.setState({
            focused: "input-group-focus"
        });
    };

    onBlur = () => {
        this.setState({
            focused: ""
        });

    };

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    };


    ResultCollapse() {
        this.setState(state => ({ collapse: !this.state.collapse }));
        if (this.state.stepPosition === 2) {
            this.SendArray();
        }
    }

    positionStep = (steps) => {
        var Position = this.state.stepPosition;
        this.setState({
            collapse: false,
        });
        if (steps === 1 && Position < this.state.steps.length - 1)
            if (this.valida()) {
                return this.setState({ stepPosition: Position += + 1 });
            }
        if (steps !== 1 && Position > 0)
            return this.setState({ stepPosition: Position += - 1 });
    };

    RangeChange = (op) => {
        if (op === '+') {
            if ((this.state.value + this.state.step) > 100) {
                this.setState(
                    { value: 100 })
            } else {
                this.setState(
                    { value: this.state.value + this.state.step })
            }
        } else {
            if ((this.state.value - this.state.step) <= 0) {
                this.setState(
                    { value: 0 })
            }
            else {
                this.setState(
                    { value: (this.state.value - this.state.step) })
            }
        }
        // this.Calcular();
    }

    valida = () => {
        if (this.state.stepPosition === 0) {
            if (this.state.tags === null || this.state.tags.length === 0) {
                this.setState({ message: 'Digite algum valor' });
                return false;
            }
            else {
                this.setState({ message: '' });
                return true;
            }
        }
        else if (this.state.stepPosition === 1) {
            if (this.state.Var == null || this.state.Var.trim() === "") {
                this.setState({ message: 'Digite o nome da variável' });
                return false;
            }
            else if (this.state.PopAmost === "") {
                this.setState({ message: 'Selecione o tipo de distribuição dos dados' });
                return false;
            }
            else {
                this.setState({ message: '' });
                this.SendArray();
                return true;
            }
        }
        else if (this.state.stepPosition === 2) {
            if (this.state.rSelected == null || this.state.rSelected.trim() === "") {
                this.setState({ message: 'Selecione o tipo de análise desejada' });
                return false;
            }
            else {
                this.setState({ message: '' });
                return true;
            }

        }
    };

    render() {
        let button = [];
        let Position = this.state.stepPosition;
        let Card_Body;
        let ButtonType;

        button.push(
            <Button
                className="btn-round btn-icon"
                color="primary"
                onClick={() => this.positionStep(0)}>
                <i className="tim-icons icon-double-left" />
            </Button>
        );
        button.push(
            <Button
                className="btn-round btn-icon"
                color="primary"
                onClick={() => this.positionStep(1)}>
                <i className="tim-icons icon-double-right" />
            </Button>);
        if (Position === 0) {
            Card_Body = <CardBody style={{ marginLeft: '10%', marginRight: '10%' }}>
                <CardTitle>Digite os valores da variável estudada</CardTitle>
                <TagInput tags={this.state.tags}
                    tagStyle={`
                    background: linear-gradient(to bottom right, #550300, #d32a23, #550300);`}
                    onTagsChanged={this.onTagsChanged}
                    placeholder="Digite um valor e pressione ENTER" />

            </CardBody>
        } else if (Position === 1) {
            Card_Body = <CardBody style={{ marginLeft: '10%', marginRight: '10%' }}>
                <Container >
                    <MDBRow className="mx-auto" >
                        <MDBCol >
                            <CardTitle>Nome da variável estudada:</CardTitle>
                            <InputGroup className={this.state.focused}>
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText><i className="fab fa-dribbble"></i></InputGroupText>
                                </InputGroupAddon>
                                <Input
                                    type="text"
                                    name="Var"
                                    value={this.state.Var}
                                    placeholder="Variável"
                                    onFocus={this.onFocus}
                                    onBlur={this.onBlur}
                                    onChange={this.handleChange}
                                />
                            </InputGroup>

                        </MDBCol>
                        <MDBCol >
                            <CardTitle>Tipo de distribuição de dados:</CardTitle>
                            <ButtonGroup>
                                <Button color={this.buttoncolor('PopAmost', 'População')} onClick={() => this.onRadioBtnClick('PopAmost', 'População')} active={this.state.PopAmost === 'População'}>População</Button>
                                <Button color={this.buttoncolor('PopAmost', 'Amostra')} onClick={() => this.onRadioBtnClick('PopAmost', 'Amostra')} active={this.state.PopAmost === 'Amostra'}>Amostra</Button>
                            </ButtonGroup>
                            {/* <p>Selected: {this.state.PopAmost}</p> */}
                        </MDBCol>
                    </MDBRow>
                </Container>
            </CardBody>
        } else if (Position === 2) {

            if (this.state.Type === 'Qualitativo') {
                ButtonType = <ButtonGroup>
                    <Button color={this.buttoncolor('QntQuali', 'Nominal')} onClick={() => this.onRadioBtnClick('QntQuali', 'Nominal')} active={this.state.rSelected === 'Nominal'}>Nominal</Button>
                    <Button color={this.buttoncolor('QntQuali', 'Ordinal')} onClick={() => this.onRadioBtnClick('QntQuali', 'Ordinal')} active={this.state.rSelected === 'Ordinal'}>Ordinal</Button>
                </ButtonGroup>
            } else if (this.state.Type === 'Quantitativo') {

                if (this.state.rSelected !== 'Contínua') {
                    ButtonType = <ButtonGroup>
                        <Button color={this.buttoncolor('QntQuali', 'Contínua')} onClick={() => this.onRadioBtnClick('QntQuali', 'Contínua')} active={this.state.rSelected === 'Contínua'}>Contínua</Button>
                        <Button color={this.buttoncolor('QntQuali', 'Discreta')} onClick={() => this.onRadioBtnClick('QntQuali', 'Discreta')} active={this.state.rSelected === 'Discreta'}>Discreta</Button>
                    </ButtonGroup>
                } else {
                    ButtonType = <ButtonGroup>
                        <Button disabled color={this.buttoncolor('QntQuali', 'Contínua')} active={this.state.rSelected === 'Contínua'}>Contínua</Button>
                        <Button disabled color={this.buttoncolor('QntQuali', 'Discreta')} active={this.state.rSelected === 'Discreta'}>Discreta</Button>
                    </ButtonGroup>
                }
            }
            Card_Body = <CardBody style={{ marginLeft: '10%', marginRight: '10%' }}>
                <Container >
                    <MDBRow className="mx-auto" >
                        <MDBCol >
                            <CardTitle>Variável estudada: <b>{this.state.Var}</b></CardTitle>
                            <TagInput placeholder="Valores da variável" addTagOnEnterKeyPressed={false} tagStyle={`
                            background: linear-gradient(to bottom left, #550300, #d32a23, #550300);`} inputStyle={`
                            display: none;
                            `} tagDeleteStyle={`
                            display: none;
                            `} tags={this.state.tags} /><br />
                            <br />
                        </MDBCol>
                        <MDBCol >
                            <CardTitle>Tipo de distribuição de dados: <b>{this.state.PopAmost}</b></CardTitle>
                            <CardTitle>Tipo de análise de dados desejada:</CardTitle>
                            {ButtonType}
                            {/* <p>Selected: {this.state.rSelected}</p> */}
                            <Button style={{ width: '100%' }} color="primary" type="button" onClick={() => this.ResultCollapse()}>
                                Aplicar
                            </Button>
                        </MDBCol>
                    </MDBRow>
                    <Collapse isOpen={this.state.collapse}>
                        <div><br /><br />
                            <table id='students' hover>
                                <tbody>
                                    <tr>{this.renderTableHeader()}</tr>
                                    {this.renderTableData()}
                                </tbody>
                            </table>
                        </div>
                    </Collapse>
                </Container>

            </CardBody>
        } else if (Position === 3) {
            Card_Body = <CardBody style={{ marginLeft: '10%', marginRight: '10%' }}>
                <Container >
                    <MDBRow className="mx-auto" >
                        <MDBCol >
                            <CardTitle>Variável estudada: <b>{this.state.Var}</b></CardTitle>
                            <TagInput placeholder="Valores da variável" addTagOnEnterKeyPressed={false} tagStyle={`
                            background: linear-gradient(to bottom left, #550300, #d32a23, #550300);`} inputStyle={`
                            display: none;
                            `} tagDeleteStyle={`
                            display: none;
                            `} tags={this.state.tags} /><br />
                            <br />
                        </MDBCol>
                        <MDBCol >
                            <CardTitle>Tipo de distribuição de dados: <b>{this.state.PopAmost}</b></CardTitle>
                            <CardTitle>Tipo de análise de dados desejada: <b>{this.state.rSelected}</b></CardTitle>
                            <ComboBox value={this.state.MedSep} data={['Quartil', 'Quintil', 'Decil', 'Percentil']} onChange={event => this.onChangeCB(event.target.value)} color={'primary'} style={{ color: 'black' }} /><br /><br />


                            <form>
                                <Row>
                                    <Col className="text-center text-md-right" sm={{ size: 2 }}>
                                        <Button color={'primary'}
                                            onClick={() => this.RangeChange('-')}
                                            size="sm">-</Button>
                                    </Col>
                                    <Col className="text-center text-md-right" sm={{ size: 7 }}>
                                        <InputRange
                                            style={{ backgroundColor: '#000' }}
                                            step={this.state.step}
                                            maxValue={100}
                                            minValue={0}
                                            value={this.state.value}
                                            formatLabel={value => `${value}%`}
                                            onChange={value =>
                                                this.setState({
                                                    value
                                                })} ></InputRange>
                                    </Col>
                                    <Col className="text-center text-md-left" sm={{ size: 1 }}>
                                        <Button color={'primary'}
                                            onClick={() => this.RangeChange('+')}
                                            size="sm">+</Button>
                                    </Col>
                                </Row>
                            </form>
                            {/* <Button style={{ width: '100%' }} color="primary" type="button" onClick={() => this.Calcular()}>
                                Aplicar
                            </Button> */}
                        </MDBCol>
                    </MDBRow>
                    {/* <Collapse isOpen={this.state.collapse}> */}
                    <div><br /><br />

                        <ListGroup>
                            <ListGroupItem style={{ backgroundColor: 'transparent' }}
                                className="justify-content-between">Média Ponderada Simples: <Badge pill>{this.state.weightedMean}</Badge></ListGroupItem>
                            <ListGroupItem style={{ backgroundColor: 'transparent' }}
                                className="justify-content-between">Moda: <Badge pill>{this.state.mode}</Badge></ListGroupItem>
                            <ListGroupItem style={{ backgroundColor: 'transparent' }}
                                className="justify-content-between">Mediana: <Badge pill>{this.state.median}</Badge></ListGroupItem>
                            <ListGroupItem style={{ backgroundColor: 'transparent' }}
                                className="justify-content-between">Variância: <Badge pill>{this.state.variance}</Badge></ListGroupItem>
                            <ListGroupItem style={{ backgroundColor: 'transparent' }}
                                className="justify-content-between">Desvio Padrão: <Badge pill>{this.state.deviation}</Badge></ListGroupItem>
                            <ListGroupItem style={{ backgroundColor: 'transparent' }}
                                className="justify-content-between">Coeficiente de Variação: <Badge pill>{this.state.coefvar}</Badge></ListGroupItem>
                            <ListGroupItem style={{ backgroundColor: 'transparent' }}
                                className="justify-content-between">{this.state.MedSep} ({((this.state.value * (100 / this.state.step)) / 100)}): <Badge pill>{this.state.percentile[this.state.value - 1]}</Badge></ListGroupItem>

                        </ListGroup><br /><br />

                        <table id='students' hover>
                            <tbody>
                                <tr>{this.renderTableHeader()}</tr>
                                {this.renderTableData()}
                            </tbody>
                        </table>
                    </div>
                    {/* </Collapse> */}



                </Container>

            </CardBody>




        }
        return (
            <>
                <div className="content">
                    <Row>
                        <Col md="12">
                            <Card>
                                <CardHeader>Estatística Descritiva</CardHeader>
                                <CardBody>
                                    <Card>
                                        <Stepper steps={this.state.steps}
                                            activeStep={this.state.stepPosition}
                                            activeColor={"#750f0f"}
                                            completeColor={"#c45858"} />
                                        <CardBody>
                                            {
                                                this.state.message !== '' ? (
                                                    <Alert color={"danger"} className="text-center">{this.state.message}</Alert>
                                                ) : ''}

                                            {Card_Body}

                                            {button[0]}
                                            {button[1]}
                                            {button[2]}
                                        </CardBody>


                                    </Card>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </>
        );
    }
};

export default Descriptive;