import {useContext, useEffect, useState} from 'react';
import {useHistory} from 'react-router';
import {UserContext} from '../lib/UserContext';
import Loading from './loading';
import Container from "@material-ui/core/Container";
import OnramperWidget from "@onramper/widget";
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import {contract, web3} from "../lib/magic";
import {Box, Grid, IconButton, Paper, TextField} from "@material-ui/core";

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import * as PropTypes from "prop-types";

function StepperControls(props) {
    return <Grid container justifyContent={"center"} spacing={2} style={{margin: "auto"}}>
        <Grid item>
            <Button disabled={props.activeStep === 0} onClick={props.onClick}>
                <ArrowBackIosIcon/> previous
            </Button>
        </Grid>
        <Grid item>
            <Button
                variant="contained"
                color="primary"
                onClick={props.onClick1}>
                next <ArrowForwardIosIcon/>
            </Button>
        </Grid>
    </Grid>;
}

StepperControls.propTypes = {
    activeStep: PropTypes.number,
    onClick: PropTypes.func,
    onClick1: PropTypes.func
};
const Home = () => {
    const [user] = useContext(UserContext);
    const history = useHistory();

    // let [userAddress, setUserAddress] = useState();
    let [userBalance, setUserBalance] = useState(0);
    let [conversionRate, setConversionRate] = useState(1.0);
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState({});
    const steps = getSteps();

    const totalSteps = () => {
        return steps.length;
    };

    const completedSteps = () => {
        return Object.keys(completed).length;
    };

    const isLastStep = () => {
        return activeStep === totalSteps() - 1;
    };

    const allStepsCompleted = () => {
        return completedSteps() === totalSteps();
    };

    const handleNext = () => {
        const newActiveStep =
            isLastStep() && !allStepsCompleted()
                ? // It's the last step, but not all steps have been completed,
                  // find the first step that has been completed
                steps.findIndex((step, i) => !(i in completed))
                : activeStep + 1;
        setActiveStep(newActiveStep);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStep = (step) => () => {
        setActiveStep(step);
    };

    // const handleComplete = () => {
    //     const newCompleted = completed;
    //     newCompleted[activeStep] = true;
    //     setCompleted(newCompleted);
    //     handleNext();
    // };


    let [amount, setAmount] = useState(0);
    let [btnState, setBtnState] = useState({val: "Invest", disabled: true});

    const getWallets = () => {
        return {BNB: {address: user.publicAddress, memo: "Binance Smart Chain"}}
    }

    const handleChangeAmt = (event) => {
        let amt = event.target.value;
        setAmount(amt);
        if (amt > 0) {
            setBtnState({...btnState, disabled: false});
        }
    };


    let getBalance = async function () {
        // const fromAddress = (await web3.eth.getAccounts())[0];
        // console.log(fromAddress);
        // console.log(user);
        let userAddress = user.publicAddress;
        let balance = web3.utils.fromWei(
            await web3.eth.getBalance(userAddress) // Balance is in wei
        );

        // console.log(user);
        // console.log(balance);
        setUserBalance(balance);
    };

    // If not loading and no user found, redirect to /login
    useEffect(() => {
        user && !user.loading && !user.issuer && history.push('/login');


        let getConversion = async function () {
            let rate = fetch('https://api.coinbase.com/v2/exchange-rates?currency=BNB')
                .then((data) => data.json())
                .then((data) => {
                    // console.log(data)
                    return data.data.rates
                })
                .then((rates) => rates.USD);

            setConversionRate(await rate);
        }

        // console.log(user);
        // console.log(contract);
        user && !user.loading && user.issuer && getBalance();
        getConversion();

    }, [user]);

    const handleSendTxn = async () => {
        // e.preventDefault();
        // const destination = new FormData(e.target).get('destination');
        // const amount = new FormData(e.target).get('amount');
        // if (destination && amount) {
        // const btnSendTxn = document.getElementById('btn-send-txn');
        setBtnState({val: "Sending...", disabled: true});
        // btnSendTxn.innerText = 'Sending...';
        // const fromAddress = (await web3.eth.getAccounts())[0];
        // Submit transaction to the blockchain and wait for it to be mined

        const receipt = await web3.eth.sendTransaction({
            from: user.publicAddress,
            to: contract.address,
            value: web3.utils.toWei(amount),
        }).then(() => {
            getBalance();
            handleNext();
        }).catch(() => {
            // console.log('bad transaction')
        }).finally(() => {
            setBtnState({val: "Invest", disabled: false});
        });

        // console.log('Completed:', receipt);
    };

    // console.log(user);


    function getSteps() {
        return ['Transfer Money into Wallet', 'Invest Cryptocurrency', 'View Yield'];
    }

    function getStepContent(step) {
        switch (step) {
            case 0:
                return (
                    <div style={{
                        width: "440px",
                        height: "595px",
                        // margin: "0 auto"
                    }}>
                        <OnramperWidget
                            API_KEY={process.env.REACT_APP_ONRAMPER_KEY}
                            // color={defaultColor}
                            // fontFamily={fontFamily}
                            defaultAddrs={getWallets()}
                            // defaultAmount={10}
                            // defaultCrypto={'BNB'}
                            defaultFiat={'USD'}
                            // defaultFiatSoft={defaultFiatSoft}
                            // defaultPaymentMethod={defaultPaymentMethod}
                            filters={{
                                onlyCryptos: ["BNB"],
                                // excludeCryptos: excludeCryptos,
                                // onlyPaymentMethods: onlyPaymentMethods,
                                // excludePaymentMethods: excludePaymentMethods,
                                // excludeFiat: excludeFiat,
                                // onlyGateways: onlyGateways,
                                // onlyFiat: onlyFiat,
                            }}
                            isAddressEditable={false}
                            // amountInCrypto={amountInCrypto}
                            // redirectURL={redirectURL}
                        />
                    </div>);
            case 1:
                return (
                    <Box>
                        <Grid container alignItems={"flex-end"} spacing={2}>
                            <Grid item xs={12}>

                                <TextField
                                    id="standard-number"
                                    label="Investing Amount"
                                    type="number"
                                    InputLabelProps={{shrink: true}}
                                    value={amount}
                                    fullWidth
                                    onChange={handleChangeAmt}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="primary" fullWidth
                                        onClick={user ? handleSendTxn : null}
                                        disabled={btnState.disabled}>
                                    {btnState.val}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>);
            case 2:
                return <Typography variant={"h6"}>Balance: {userBalance} BNB</Typography>;
            default:
                return 'Unknown step';
        }
    }

    return <>{!user?.loading && user?.issuer &&
    <Container maxWidth="md">

        <Paper elevation={0} style={{background: "#efefef", padding: 20}}>
            <Grid container>
                <Grid item>
                    <Typography variant={"h4"}>{userBalance} BNB
                        (${(conversionRate * userBalance).toFixed(2)})</Typography>
                    <Typography variant={"subtitle2"} color={"textSecondary"}>
                        Public Address: {user.publicAddress}
                    </Typography>
                </Grid>
            </Grid>
        </Paper>

        <Stepper nonLinear activeStep={activeStep}>
            {steps.map((label, index) => (
                <Step key={label}>
                    <StepButton onClick={handleStep(index)} completed={completed[index]}>
                        {label}
                    </StepButton>
                </Step>
            ))}
        </Stepper>
        <Box mx={"auto"}>
            <div>
                <StepperControls activeStep={activeStep} onClick={handleBack} onClick1={handleNext}/>
                <Box style={{
                    display: "flex",
                    justifyContent: "center",
                    minHeight: 500,
                    padding: 20,
                }}>{getStepContent(activeStep)}</Box>
                <StepperControls activeStep={activeStep} onClick={handleBack} onClick1={handleNext}/>
            </div>
        </Box>


    </Container>}
    </>;
};

export default Home;
