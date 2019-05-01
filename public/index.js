const {
    Button,
    colors,
    createMuiTheme,
    CssBaseline,
    AppBar,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Icon,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    MuiThemeProvider,
    Paper,
    Snackbar,
    Toolbar,
    Typography,
    TextField,
    withStyles,
} = window['material-ui'];

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    },
});
const styles = theme => ({
    paper: {
        paddingTop: theme.spacing.unit * 8,
        paddingBottom: theme.spacing.unit * 12,
        boxShadow: 'none',
        backgroundColor: 'inherit',
    },
    signinPaper: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    subHeader: {
        backgroundColor: theme.palette.background.paper,
    },
    appBar: {
        top: 'auto',
        bottom: 0,
    },
    toolBar: {
        paddingLeft: theme.spacing.unit,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    card: {
        maxWidth: '83.33%',
        borderRadius: theme.spacing.unit * 2,
    },
    cardSender: {
        maxWidth: '83.33%',
        backgroundColor: '#e1f5fe',
        borderRadius: theme.spacing.unit * 2,
    },
    cardContent: {
        padding: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit + "px !important",
        paddingTop: theme.spacing.unit * 0.5 + "px !important",
    },
    cardContentSender: {
        padding: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit + "px !important",
        paddingTop: theme.spacing.unit + "px !important",
    },
    cardHeader: {
        padding: theme.spacing.unit * 2,
        paddingBottom: 0,
        paddingTop: theme.spacing.unit,
    },
    list: {
        paddingBottom: 'unset'
    },
    listSender: {
        paddingBottom: 'unset',
        justifyContent: 'flex-end',
    },
    sendBtn: {
        paddingBottom: theme.spacing.unit * 1.5 + "px !important",
    },
    grow: {
        flexGrow: 1,
    },
    time: {
        paddingTop: theme.spacing.unit * 0.25,
        paddingLeft: theme.spacing.unit * 3,
        fontSize: 10,
    },
    timeSender: {
        textAlign: 'end',
        paddingTop: theme.spacing.unit * 0.25,
        paddingRight: theme.spacing.unit * 3,
        fontSize: 10,
    },
});

const DB_ROOT = "msgs/";
var userId = null;

function getStringDate(d) {
    return d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate();
}

function getUser() {
    return firebase.auth().currentUser;
}

class Index extends React.Component {
    render() {
        const { classes } = this.props;
        return (
            <MuiThemeProvider theme={theme}>
                <div>
                    <CssBaseline />
                    <TopBar {...this.props}></TopBar>
                    <MsgThread {...this.props}></MsgThread>
                    <BottomBar {...this.props}></BottomBar>
                </div>
            </MuiThemeProvider>
        );
    }
}

class MsgThread extends React.Component {
    state = {
        messages: [],
    };
    messagesEnd = React.createRef();

    componentDidUpdate() {
        this.scrollToBottom();
    }

    componentDidMount() {
        let observeMsgsChanges = () => {
            this.observeMsgsChanges();
        }
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                observeMsgsChanges();
                userId = user.uid;
            }
        });
        this.scrollToBottom();
    }

    observeMsgsChanges() {
        let d = new Date();
        let date = getStringDate(d);
        let handleOnAdded = (data) => {
            this.setState(state => ({
                messages: [...state.messages, {
                    id: data.key,
                    msg: data.val().msg,
                    uid: data.val().uid,
                    timestamp: data.val().timestamp,
                    displayName: data.val().displayName,
                }],
            }));
        }
        var msgsRef = firebase.database().ref(DB_ROOT + date);
        msgsRef.on('child_added', function (data) {
            handleOnAdded(data);
        });
    }

    scrollToBottom() {
        this.messagesEnd.current.scrollIntoView({ behavior: 'smooth' })
    }

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <Paper square className={classes.paper}>
                    <List className={classes.list}>
                        {this.state.messages.map(({ id, msg, uid, timestamp, displayName }) => (
                            <Msg key={id} msg={{ id, msg, uid, timestamp, displayName }} {...this.props}></Msg>
                        ))}
                        <div ref={this.messagesEnd} />
                    </List>
                </Paper>
            </React.Fragment>
        );
    }
}

class Msg extends React.Component {
    render() {
        const { classes, msg } = this.props;
        let isSender = false;
        if (msg.uid == userId) {
            isSender = true;
        }
        let time = new Date(Number(msg.id)).toLocaleTimeString('en-US', { hour: "2-digit", minute: "2-digit" });
        let displayName = msg.displayName;
        return (
            <React.Fragment>
                <ListItem className={isSender ? classes.listSender : classes.list}>
                    <Card className={isSender ? classes.cardSender : classes.card}>
                        {isSender ? null : <React.Fragment>
                            <CardHeader
                                className={classes.cardHeader}
                                title={displayName}
                                titleTypographyProps={{ variant: "caption", color: "textSecondary" }}
                            />
                        </React.Fragment>}
                        <CardContent className={isSender ? classes.cardContentSender : classes.cardContent}>
                            <Typography>
                                {msg.msg}
                            </Typography>
                        </CardContent>
                    </Card>
                </ListItem>
                <Typography className={isSender ? classes.timeSender : classes.time}
                    variant="caption"
                    color="textSecondary"
                >
                    {time}
                </Typography>
            </React.Fragment>
        );
    }
}

class BottomBar extends React.Component {
    state = {
        message: '',
        loading: false,
        open: false,
        errorMsg: '',
    };

    handleChange = () => event => {
        this.setState({
            message: event.target.value,
        });
    };

    handleClose = () => {
        this.setState({
            open: false,
        });
    };

    handleClickSend = () => {
        let errorMsg = '';
        if (getUser() === null) {
            errorMsg = 'Please sign in';
            this.setState({
                open: true,
                errorMsg: errorMsg,
            });
            return;
        }

        this.setState({
            loading: true,
        });
        let d = new Date();
        let date = getStringDate(d);
        let msgId = d.getTime();
        firebase.database().ref(DB_ROOT + date + "/" + msgId).set({
            msg: this.state.message,
            uid: userId,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            displayName: getUser().displayName,
        }).then(() => {
            this.setState({
                message: '',
                loading: false,
            });
        }).catch((error) => {
            if (error.code === 'PERMISSION_DENIED') {
                errorMsg = 'Permission denied to database';
            }
            this.setState({
                loading: false,
                open: true,
                errorMsg: errorMsg,
            });
        });
    };

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <AppBar className={classes.appBar} position="fixed" color="default" elevation={8}>
                    {this.state.loading && <LinearProgress />}
                    <Toolbar className={classes.toolBar} disableGutters>
                        <Grid container spacing={8} alignItems="flex-end">
                            <Grid item xs>
                                <TextField
                                    autoFocus
                                    fullWidth
                                    multiline
                                    rowsMax="4"
                                    value={this.state.message}
                                    onChange={this.handleChange()}
                                    margin="dense"
                                    variant="outlined"
                                    placeholder="Type a message"
                                />
                            </Grid>
                            <Grid item className={classes.sendBtn}>
                                <IconButton onClick={this.handleClickSend}>
                                    <Icon>send</Icon>
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
                <Notification
                    message={this.state.errorMsg}
                    open={this.state.open}
                    onClose={this.handleClose}
                />
            </React.Fragment>
        );
    }
}

class TopBar extends React.Component {
    state = {
        open: false,
        isLogin: true,
    };

    componentDidMount() {
        let setState = (obj) => {
            this.setState(obj);
        }
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                setState({
                    isLogin: true,
                });
            } else {
                setState({
                    isLogin: false,
                });
            }
        });
    }

    handleClickOpen = () => {
        this.setState({
            open: true,
        });
    };

    handleClose = () => {
        this.setState({
            open: false,
        });
    };

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <AppBar position="fixed">
                    <Toolbar>
                        <Typography variant="h6" color="inherit" className={classes.grow}>
                            React Chat
                        </Typography>
                        {this.state.isLogin ? null : <React.Fragment>
                            <Button color="inherit" onClick={this.handleClickOpen}>
                                Login
                            </Button>
                            <AuthDialog
                                open={this.state.open}
                                onClose={this.handleClose}
                                {...this.props}
                            />
                        </React.Fragment>}
                    </Toolbar>
                </AppBar>
            </React.Fragment>
        );
    }
}

class AuthDialog extends React.Component {
    handleClose = () => {
        this.props.onClose();
    };

    componentDidUpdate() {
        if (this.ui === undefined) {
            this.ui = new firebaseui.auth.AuthUI(firebase.auth());
        }
        let handleAuthDialogClose = () => {
            this.handleClose();
        }
        let uiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                    handleAuthDialogClose();
                    return false;
                },
                uiShown: function () {
                    document.getElementById('loader').style.display = 'none';
                }
            },
            signInFlow: 'popup',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                firebase.auth.GithubAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
                firebase.auth.PhoneAuthProvider.PROVIDER_ID
            ]
        };
        if (this.props.open) {
            window.requestAnimationFrame(() => {
                this.ui.start('#firebaseui-auth-container', uiConfig);
            });
        }
    }

    render() {
        const { classes, ...other } = this.props;
        return (
            <Dialog onClose={this.handleClose} aria-labelledby="auth-dialog" {...other}>
                <Paper className={classes.signinPaper}>
                    <div id="firebaseui-auth-container"></div>
                    <div id="loader">Loading...</div>
                </Paper>
            </Dialog>
        );
    }
}

class Notification extends React.Component {
    handleClose = () => {
        this.props.onClose();
    };

    render() {
        const { message } = this.props;
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                open={this.props.open}
                autoHideDuration={6000}
                onClose={this.handleClose}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{message}</span>}
                action={[
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={this.handleClose}
                    >
                        <Icon>close</Icon>
                    </IconButton>,
                ]}
            />
        );
    }
}
