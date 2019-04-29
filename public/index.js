const {
    Button,
    colors,
    createMuiTheme,
    CssBaseline,
    AppBar,
    Card,
    CardContent,
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
    Toolbar,
    Typography,
    TextField,
    withStyles,
} = window['material-ui'];

const cookies = new UniversalCookie();

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    },
});
const styles = theme => ({
    paper: {
        paddingBottom: theme.spacing.unit * 12,
        boxShadow: 'none',
        backgroundColor: 'inherit',
    },
    appBar: {
        top: 'auto',
        bottom: 0,
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
        paddingBottom: theme.spacing.unit * 2 + "px !important",
    },
    list: {
        justifyContent: 'flex-end',
    },
    sendBtn: {
        paddingBottom: theme.spacing.unit * 2 + "px !important",
    },
});

const DB_ROOT = "msgs/";
const COOKIE_USER_ID = "userId";
var userId = null;

function getStringDate(d) {
    return d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate();
}

class Index extends React.Component {
    componentDidMount() {
        if (cookies.get(COOKIE_USER_ID) === undefined) {
            let d = new Date();
            let uid = d.getTime();
            cookies.set(COOKIE_USER_ID, uid, { path: '/' });
        }
        userId = cookies.get(COOKIE_USER_ID);
    }

    render() {
        const { classes } = this.props;
        return (
            <MuiThemeProvider theme={theme}>
                <div>
                    <CssBaseline />
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
        let d = new Date();
        let date = getStringDate(d);
        let handleOnAdded = (data) => {
            this.setState(state => ({
                messages: [...state.messages, {
                    id: data.key,
                    msg: data.val().msg,
                    uid: data.val().uid,
                    timestamp: data.val().timestamp,
                }],
            }));
        }
        var msgsRef = firebase.database().ref(DB_ROOT + date);
        msgsRef.on('child_added', function (data) {
            handleOnAdded(data);
        });
        this.scrollToBottom();
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
                        {this.state.messages.map(({ id, msg, uid, timestamp }) => (
                            <Msg key={id} msg={{ id, msg, uid, timestamp }} {...this.props}></Msg>
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
        return (
            <React.Fragment>
                <ListItem className={isSender ? classes.list : null}>
                    <Card className={isSender ? classes.cardSender : classes.card}>
                        <CardContent className={classes.cardContent}>
                            <Typography>
                                {msg.msg}
                            </Typography>
                        </CardContent>
                    </Card>
                </ListItem>
            </React.Fragment>
        );
    }
}

class BottomBar extends React.Component {
    state = {
        message: '',
        loading: false,
    };

    handleChange = () => event => {
        this.setState({
            message: event.target.value,
        });
    };

    handleClickSend = () => {
        this.setState({
            loading: true,
        });
        let d = new Date();
        let date = getStringDate(d);
        let msgId = d.getTime();
        firebase.database().ref(DB_ROOT + date + "/" + msgId).set({
            msg: this.state.message,
            uid: userId,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            this.setState({
                message: '',
                loading: false,
            });
        });
    };

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <AppBar className={classes.appBar} position="fixed" color="default" elevation={8}>
                    {this.state.loading && <LinearProgress />}
                    <Toolbar disableGutters>
                        <Grid container spacing={8} alignItems="flex-end">
                            <Grid item xs>
                                <TextField
                                    fullWidth
                                    multiline
                                    rowsMax="4"
                                    value={this.state.message}
                                    onChange={this.handleChange()}
                                    margin="normal"
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
            </React.Fragment>
        );
    }
}
