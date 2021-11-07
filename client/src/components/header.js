import {useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';

import {Link, useHistory} from 'react-router-dom';
import {magic} from '../lib/magic';
import {UserContext} from '../lib/UserContext';
import {CallToAction, TextButton} from '@magiclabs/ui';
import {AppBar, Button, Container, Grid, Toolbar, Typography} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

const Header = () => {
    const history = useHistory();
    const [user, setUser] = useContext(UserContext);

    const logout = () => {
        magic.user.logout().then(() => {
            setUser({user: null});
            history.push('/login');
        });
    };

    const classes = useStyles();

    return (
        <AppBar position={"static"} style={{marginBottom: 20}}>
            <Toolbar>
                <Container>
                    <Grid container>
                        <Grid item xs>

                            {/*<Link href={"/"}>Poolable</Link>*/}
                            <Button color="inherit" href={"/"} style={{textTransform: "none"}}>
                                <Typography variant={"h6"} className={classes.title}>Poolable</Typography>
                            </Button>
                        </Grid>

                        <Grid item>
                            {user?.loading ? "" : user?.issuer ?
                                <>
                                    <Button color="inherit" href={"/profile"}>Profile</Button>
                                    <Button color="inherit" onClick={logout}>Logout</Button>
                                </> :
                                <Button color="inherit" href={"/logout"}>Logout</Button>}
                        </Grid>
                    </Grid>
                </Container>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
