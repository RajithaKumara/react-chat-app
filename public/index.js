const {
    Button,
    createMuiTheme,
    CssBaseline,
    AppBar,
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    Grid,
    Icon,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListSubheader,
    Menu,
    MenuItem,
    MuiThemeProvider,
    Paper,
    Slide,
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
        paddingBottom: theme.spacing.unit * 12,
        boxShadow: 'none',
        backgroundColor: 'inherit',
    },
    topPadding: {
        paddingTop: 56,
        "@media (min-width:0px) and (orientation: landscape)": {
            paddingTop: 48,
        },
        "@media (min-width:600px)": {
            paddingTop: 64,
        },
    },
    signinPaper: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
    subHeader: {
        backgroundColor: 'inherit',
        textAlign: 'center',
        top: 56,
        "@media (min-width:0px) and (orientation: landscape)": {
            top: 48,
        },
        "@media (min-width:600px)": {
            top: 64,
        },
    },
    subHeaderChip: {
        minWidth: 200,
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
    msgThreadList: {
        paddingBottom: 'unset',
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
    groupListAppBar: {
        position: 'relative',
    },
    groupListFlex: {
        flex: 1,
    },
    fabButton: {
        position: 'fixed',
        zIndex: 1,
        bottom: theme.spacing.unit * 3,
        right: theme.spacing.unit * 3,
    },
});

class Index extends React.Component {
    state = {
        groupId: null,
        groupName: null,
        groupIcon: null,
        groupListOpen: true,
        userId: null,
        userDisplayName: null,
    };

    componentDidMount() {
        let setState = (obj) => {
            this.setState(obj);
        };
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                setState({
                    userId: user.uid,
                    userDisplayName: user.displayName,
                });
            }
        });
    }

    setGlobalState = (obj) => {
        this.setState(obj);
    }

    handleGroupListClose = () => {
        this.setState({
            groupListOpen: false,
        });
    }

    handleGroupListOpen = () => {
        this.setState({
            groupListOpen: true,
        });
    }

    render() {
        const { classes } = this.props;
        return (
            <MuiThemeProvider theme={theme}>
                <div>
                    <CssBaseline />
                    <GroupList global={this.state} setGlobalState={this.setGlobalState} onClose={this.handleGroupListClose} {...this.props}></GroupList>
                    <TopBar global={this.state} onClickGroupList={this.handleGroupListOpen} {...this.props}></TopBar>
                    <MsgThread global={this.state} {...this.props}></MsgThread>
                    <BottomBar global={this.state} {...this.props}></BottomBar>
                </div>
            </MuiThemeProvider>
        );
    }
}

class MsgThread extends React.Component {
    state = {};
    messagesEnd = React.createRef();
    stickySuffix = '_sticky';

    componentDidUpdate() {
        if (this.props.global.groupId !== null && this.state[this.props.global.groupId] === undefined) {
            this.setState({
                [this.props.global.groupId]: [],
                [this.props.global.groupId + this.stickySuffix]: [],
            });
            this.observeMsgsChanges();
        }
        this.scrollToBottom();
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    observeMsgsChanges() {
        let groupId = this.props.global.groupId;
        let handleOnAdded = (data) => {
            let msgId = data.key;
            let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            let d = new Date(Number(msgId));
            let date = d.toLocaleDateString('en-DE', options);
            let sticky = this.state[groupId + this.stickySuffix];
            if (sticky.indexOf(date) === -1) {
                let stickyDate = date;
                let today = new Date();
                let yesterday = new Date(new Date().setDate(today.getDate() - 1))
                if (d.toDateString() === today.toDateString()) {
                    stickyDate = 'Today';
                } else if (d.toDateString() === yesterday.toDateString()) {
                    stickyDate = 'Yesterday';
                }
                this.setState(state => ({
                    [groupId + this.stickySuffix]: [...state[groupId + this.stickySuffix], date],
                    [groupId]: [...state[groupId], {
                        id: date,
                        isSticky: true,
                        sticky: stickyDate,
                    }],
                }));
            }
            this.setState(state => ({
                [groupId]: [...state[groupId], {
                    id: data.key,
                    msg: data.val().msg,
                    uid: data.val().uid,
                    timestamp: data.val().timestamp,
                    displayName: data.val().displayName,
                }],
            }));
        }
        let msgsRef = firebase.database().ref('/messages/' + groupId).limitToLast(100);
        msgsRef.on('child_added', function (data) {
            handleOnAdded(data);
        });
    }

    scrollToBottom() {
        this.messagesEnd.current.scrollIntoView({ behavior: 'smooth' })
    }

    render() {
        const { classes, global } = this.props;
        const classPaper = classes.paper + ' ' + classes.topPadding;
        let messages = [];
        if (global.groupId !== null && this.state[global.groupId] !== undefined) {
            messages = this.state[global.groupId];
        }
        return (
            <React.Fragment>
                <Paper square className={classPaper}>
                    <List className={classes.msgThreadList}>
                        {messages.map((msg) => (
                            <React.Fragment key={msg.id}>
                                {msg.isSticky ? <ListSubheader className={classes.subHeader}>
                                    <Chip className={classes.subHeaderChip} label={msg.sticky} />
                                </ListSubheader> : null}
                                {msg.isSticky === undefined ? <Msg msg={msg} {...this.props}></Msg> : null}
                            </React.Fragment>
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
        if (msg.uid == this.props.global.userId) {
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
        errorMsg: 'Error occured while sending message',
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
        if (this.props.global.userId === null) {
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
        let msgId = d.getTime();
        let groupId = this.props.global.groupId;
        firebase.database().ref('/messages/' + groupId + '/' + msgId).set({
            msg: this.state.message,
            uid: this.props.global.userId,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            displayName: this.props.global.userDisplayName,
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
                    <Toolbar className={classes.toolBar} disableGutters variant="dense">
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
        anchorEl: null,
        addNewMemberDialogOpen: false,
    };
    options = [
        { key: 'addNewMember', title: 'Add new member' },
    ];

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    handleAddNewMemberDialogOpen = () => {
        this.setState({
            addNewMemberDialogOpen: true,
        });
    };

    handleAddNewMemberDialogClose = () => {
        this.setState({
            addNewMemberDialogOpen: false,
        });
    };

    handleClickMenuItem = key => () => {
        this[key]();
        this.handleClose();
    };

    addNewMember = () => {
        this.handleAddNewMemberDialogOpen();
    }

    handleGroupListOpen = () => {
        this.props.onClickGroupList();
    }

    render() {
        const { classes, global } = this.props;
        return (
            <React.Fragment>
                <AppBar position="fixed">
                    <Toolbar>
                        <IconButton color="inherit" aria-label="List" onClick={this.handleGroupListOpen}>
                            <Icon>list</Icon>
                        </IconButton>
                        <Typography variant="h6" color="inherit" className={classes.grow}>
                            {global.groupName}
                        </Typography>
                        <IconButton color="inherit" aria-label="List" onClick={this.handleClick}>
                            <Icon>more_vert</Icon>
                        </IconButton>
                        <Menu
                            anchorEl={this.state.anchorEl}
                            open={Boolean(this.state.anchorEl)}
                            onClose={this.handleClose}
                        >
                            {this.options.map(({ key, title }) => (
                                <MenuItem key={key} onClick={this.handleClickMenuItem(key)}>
                                    {title}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Toolbar>
                </AppBar>
                <AddNewMemberDialog
                    open={this.state.addNewMemberDialogOpen}
                    onClose={this.handleAddNewMemberDialogClose}
                    {...this.props}
                />
            </React.Fragment>
        );
    }
}

class AuthDialog extends React.Component {
    handleClose = () => {
        this.props.onAuthDialogClose();
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
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                onClose={this.handleClose}
                aria-labelledby="auth-dialog"
                {...other}
            >
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

class GroupList extends React.Component {
    state = {
        loginDialogOpen: false,
        isLogin: false,
        newGroupDialogOpen: false,
        groups: [],
        profileDialogOpen: false,
    };

    componentDidUpdate() {
        if (this.props.global.userId !== null && !this.state.isLogin) {
            this.setState({
                isLogin: true,
            });
            this.observeGroupsChanges();
        }
    }

    handleLoginDialogOpen = () => {
        this.setState({
            loginDialogOpen: true,
        });
    };

    handleLoginDialogClose = () => {
        this.setState({
            loginDialogOpen: false,
        });
    };

    handleClose = () => {
        this.props.onClose();
    };

    handleNewGroupDialogClose = () => {
        this.setState({ newGroupDialogOpen: false });
    }

    handleNewGroupDialogOpen = () => {
        this.setState({ newGroupDialogOpen: true });
    }

    transition(props) {
        return <Slide direction="up" {...props} />;
    }

    observeGroupsChanges() {
        let uid = this.props.global.userId;
        let handleOnAdded = (data) => {
            this.setState(state => ({
                groups: [...state.groups, {
                    id: data.key,
                    name: data.val().name,
                    icon: data.val().icon,
                }],
            }));
        }
        let groupsRef = firebase.database().ref('/users/' + uid + "/groups");
        groupsRef.on('child_added', function (data) {
            handleOnAdded(data);
        });
    }

    handleClickGroup = (id, name, icon) => () => {
        this.props.setGlobalState({
            groupId: id,
            groupName: name,
            groupIcon: icon,
        });
        this.handleClose();
    }

    handleProfileDialogOpen = () => {
        this.setState({ profileDialogOpen: true });
    }

    handleProfileDialogClose = () => {
        this.setState({ profileDialogOpen: false });
    }

    render() {
        const { classes, global } = this.props;
        return (
            <React.Fragment>
                <Dialog
                    fullScreen
                    open={global.groupListOpen}
                    onClose={this.handleClose}
                    TransitionComponent={this.transition}
                >
                    <AppBar position="fixed">
                        <Toolbar>
                            <Typography variant="h6" color="inherit" className={classes.groupListFlex}>
                                Chats
                            </Typography>
                            {this.state.isLogin ? null : <React.Fragment>
                                <Button color="inherit" onClick={this.handleLoginDialogOpen}>
                                    Login
                                </Button>
                                <AuthDialog
                                    open={this.state.loginDialogOpen}
                                    onAuthDialogClose={this.handleLoginDialogClose}
                                    {...this.props}
                                />
                            </React.Fragment>}
                            {!this.state.isLogin ? null : <React.Fragment>
                                <IconButton color="inherit" aria-label="Account" onClick={this.handleProfileDialogOpen}>
                                    <Icon>account_circle</Icon>
                                </IconButton>
                            </React.Fragment>}
                            <ProfileDialog
                                open={this.state.profileDialogOpen}
                                onClose={this.handleProfileDialogClose}
                                global={this.props.global}
                                setGlobalState={this.props.setGlobalState}
                            />
                            <NewGroupDialog
                                open={this.state.newGroupDialogOpen}
                                onClose={this.handleNewGroupDialogClose}
                                global={this.props.global}
                            />
                        </Toolbar>
                    </AppBar>
                    <List className={classes.topPadding}>
                        {this.state.groups.map(({ id, name, icon }) => (
                            <ListItem button key={id} onClick={this.handleClickGroup(id, name, icon)}>
                                <ListItemAvatar>
                                    <Avatar>{icon}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={name} />
                            </ListItem>
                        ))}
                    </List>
                    {!this.state.isLogin ? null : <React.Fragment>
                        <Fab onClick={this.handleNewGroupDialogOpen} aria-label="Add" className={classes.fabButton}>
                            <Icon>add</Icon>
                        </Fab>
                    </React.Fragment>}
                </Dialog>
            </React.Fragment>
        );
    }
}

class NewGroupDialog extends React.Component {
    state = {
        groupName: '',
        icon: '',
        open: false,
        errorMsg: '',
    };

    handleClose = () => {
        this.props.onClose();
    };

    handleNotificationClose = () => {
        this.setState({
            open: false,
        });
    }

    handleChange = (key) => event => {
        this.setState({
            [key]: event.target.value,
        });
    };

    createNewGroup = () => {
        let groupId = firebase.database().ref().child('groups').push().key;
        let uid = this.props.global.userId;
        let updates = {};
        updates['/groups/' + groupId + '/users/' + uid] = true;
        updates['/groups/' + groupId + '/general/name'] = this.state.groupName;
        updates['/groups/' + groupId + '/general/icon'] = this.state.icon;
        updates['/users/' + uid + '/groups/' + groupId] = { name: this.state.groupName, icon: this.state.icon };
        firebase.database().ref().update(updates).then(() => {
            this.setState({
                groupName: '',
                icon: '',
            });
            this.handleClose();
        }).catch((error) => {
            this.setState({
                open: true,
                errorMsg: "Error occured while creating new group"
            });
        });
    }

    render() {
        return (
            <React.Fragment>
                <Dialog
                    open={this.props.open}
                    onClose={this.handleClose}
                    fullWidth
                >
                    <DialogTitle>New Group</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Group name"
                            fullWidth
                            onChange={this.handleChange('groupName')}
                        />
                        <TextField
                            margin="dense"
                            id="icon"
                            label="Profile icon letters"
                            fullWidth
                            onChange={this.handleChange('icon')}
                            value={this.state.icon}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.createNewGroup} color="primary">
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
                <Notification
                    message={this.state.errorMsg}
                    open={this.state.open}
                    onClose={this.handleNotificationClose}
                />
            </React.Fragment>
        );
    }
}

class AddNewMemberDialog extends React.Component {
    state = {
        profiles: [],
        checked: [],
        open: false,
        errorMsg: '',
        subscribed: false,
    };

    componentDidUpdate() {
        if (this.props.global.userId != null && !this.state.subscribed) {
            this.setState({
                subscribed: true,
            });
            let handleOnAdded = (data) => {
                this.setState(state => ({
                    profiles: [...state.profiles, {
                        id: data.key,
                        displayName: data.val().displayName,
                        icon: data.val().icon,
                        status: data.val().status,
                    }],
                }));
            }
            let profilesRef = firebase.database().ref('/profiles');
            profilesRef.on('child_added', function (data) {
                handleOnAdded(data);
            });
        }
    }

    handleClose = () => {
        this.props.onClose();
    }

    handleToggle = id => () => {
        const { checked } = this.state;
        const currentIndex = checked.indexOf(id);
        const newChecked = [...checked];
        if (currentIndex === -1) {
            newChecked.push(id);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        this.setState({
            checked: newChecked,
        });
    }

    handleNotificationClose = () => {
        this.setState({
            open: false,
        });
    }

    addNewMembers = () => {
        let groupId = this.props.global.groupId;
        let groupName = this.props.global.groupName;
        let groupIcon = this.props.global.groupIcon;
        let updates = {};
        this.state.checked.forEach(uid => {
            updates['/groups/' + groupId + '/users/' + uid] = true;
            updates['/users/' + uid + '/groups/' + groupId] = { name: groupName, icon: groupIcon };
        });
        firebase.database().ref().update(updates).then(() => {
            this.setState({
                checked: [],
            });
            this.handleClose();
        }).catch((error) => {
            this.setState({
                open: true,
                errorMsg: "Error occured while adding new members"
            });
        });
    }

    render() {
        const { global } = this.props;
        return (
            <React.Fragment>
                <Dialog
                    fullWidth
                    open={this.props.open}
                    onClose={this.handleClose}
                >
                    <DialogTitle>Add new members</DialogTitle>
                    <DialogContent>
                        <List>
                            {this.state.profiles.map(({ id, displayName, icon, status }) => (
                                <React.Fragment key={id}>
                                    {global.userId === id ? null : <ListItem dense button onClick={this.handleToggle(id)}>
                                        <ListItemAvatar>
                                            <Avatar>{icon}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={displayName} secondary={status} />
                                        <Checkbox
                                            checked={this.state.checked.indexOf(id) !== -1}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItem>}
                                </React.Fragment>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.addNewMembers} color="primary">
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>
                <Notification
                    message={this.state.errorMsg}
                    open={this.state.open}
                    onClose={this.handleNotificationClose}
                />
            </React.Fragment>
        );
    }
}

class ProfileDialog extends React.Component {
    state = {
        displayName: '',
        icon: '',
        status: '',
        open: false,
        errorMsg: '',
        subscribed: false,
    };

    componentDidUpdate() {
        if (this.props.global.userId !== null && !this.state.subscribed) {
            this.setState({
                subscribed: true,
                displayName: this.props.global.userDisplayName,
            });
            let setState = (obj) => {
                this.setState(obj);
            }
            let setDisplayName = (displayName) => {
                this.props.setGlobalState({
                    userDisplayName: displayName,
                })
            }
            let uid = this.props.global.userId;
            let profileRef = firebase.database().ref('/profiles/' + uid);
            profileRef.on('child_added', function (data) {
                setState({
                    [data.key]: data.val(),
                });
                if (data.key === 'displayName') {
                    setDisplayName(data.val());
                }
            });
        }
    }

    handleClose = () => {
        this.props.onClose();
    };

    handleNotificationClose = () => {
        this.setState({
            open: false,
        });
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };;

    updateProfile = () => {
        let uid = this.props.global.userId;
        firebase.database().ref('/profiles/' + uid).set({
            displayName: this.state.displayName,
            icon: this.state.icon,
            status: this.state.status,
        }).then(() => {
            this.handleClose();
        }).catch((error) => {
            this.setState({
                open: true,
                errorMsg: "Error occured while updating profile",
            });
        });
    }

    render() {
        return (
            <React.Fragment>
                <Dialog
                    open={this.props.open}
                    onClose={this.handleClose}
                    fullWidth
                >
                    <DialogTitle>Profile</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Name"
                            fullWidth
                            onChange={this.handleChange('displayName')}
                            value={this.state.displayName}
                        />
                        <TextField
                            margin="dense"
                            id="icon"
                            label="Profile icon letters"
                            fullWidth
                            onChange={this.handleChange('icon')}
                            value={this.state.icon}
                        />
                        <TextField
                            margin="dense"
                            id="status"
                            label="Status"
                            fullWidth
                            onChange={this.handleChange('status')}
                            value={this.state.status}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.updateProfile} color="primary">
                            Update
                        </Button>
                    </DialogActions>
                </Dialog>
                <Notification
                    message={this.state.errorMsg}
                    open={this.state.open}
                    onClose={this.handleNotificationClose}
                />
            </React.Fragment>
        );
    }
}
