import {useEffect, useContext} from 'react';
import {useHistory} from 'react-router-dom';
import {UserContext} from '../lib/UserContext';
import Loading from './loading';
import {Grid, Paper} from "@material-ui/core";
import {contract} from "../lib/magic";

const Profile = () => {
    const history = useHistory();
    const [user] = useContext(UserContext);

    // Redirect to login page if not loading and no user found
    useEffect(() => {
        user && !user.loading && !user.issuer && history.push('/login');

        // const res = contract.methods.
    }, [user, history]);

    return (
        <>
            {user?.loading ? (
                <Loading/>
            ) : (
                user?.issuer && (
                    <>
                        <p>Email: {user.email}</p>
                        <p>User Id: {user.issuer}</p>
                        <p>BNB Public Address: {user.publicAddress}</p>

                        <Grid container spacing={2} style={{margin: "20px 0"}}>
                            <Grid item xs>
                                <Paper variant={"outlined"} style={{padding: 10}}>
                                    Peoaple
                                </Paper>
                            </Grid>
                        </Grid>

                    </>
                )
            )}
        </>
    );
};

export default Profile;
