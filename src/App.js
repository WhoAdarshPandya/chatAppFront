import {
  Button,
  Divider,
  List,
  ListItemText,
  ListItem,
  Paper,
  TextField,
  Typography,
  Slide,
  Dialog,
  IconButton,
  AppBar,
  Toolbar,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import CloseIcon from "@material-ui/icons/Close";
import "./App.css";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function App() {
  const [socket, setSocket] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [userMsg, setUserMsg] = useState("");
  const [uid] = useState(uuid());
  const [friends, setFriends] = useState([]);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [open, setOpen] = useState(false);
  const [friendName, setFriendname] = useState("");
  useEffect(() => {
    if (isLoggedin === true) {
      console.log("true");
      let ws = new WebSocket(
        `ws://nameless-hamlet-68401.herokuapp.com/ws/${uid}/${name}`
      );
      console.log(ws);
      setSocket(ws);
      ws.onmessage = (event) => {
        console.log(JSON.parse(event.data));
        if (JSON.parse(event.data).event === "chat") {
          setMsgs((prev) => [
            ...prev,
            {
              id: JSON.parse(event.data).client_id,
              text: JSON.parse(event.data).msg,
            },
          ]);
        }

        if (JSON.parse(event.data).event === "friends") {
          console.log(JSON.parse(event.data).friends);
          setFriends(JSON.parse(event.data).friends);
        }
      };
    }
  }, [isLoggedin, uid, name]);
  const handleButtonClick = () => {
    socket.send(JSON.stringify({ msg: userMsg, id }));
    setUserMsg("");
  };

  const handleClickButtonLogin = () => {
    if (name !== "") {
      setIsLoggedin(true);
    } else {
      alert("enter name");
    }
  };

  return (
    <div>
      {isLoggedin ? (
        <React.Fragment>
          <br />
          <br />
          <Paper elevation={5} className="frndlist">
            <Typography variant="h3" color="primary">
              available friends
            </Typography>
            <br />
            <List className="fff">
              <Typography variant="body2">friends</Typography>
              {friends !== null &&
                friends.map(
                  (friend) =>
                    friend.name !== name && (
                      <div key={friend.client_id}>
                        <ListItem
                          button
                          onClick={() => {
                            setId(friend.client_id);
                            setFriendname(friend.name);
                            setOpen(true);
                          }}
                        >
                          <ListItemText
                            button
                            key={friend.client_id}
                            primary={friend.name}
                            secondary="available"
                          />
                        </ListItem>
                        <Divider />
                      </div>
                    )
                )}
            </List>
          </Paper>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="login__screen">
            <TextField
              label="Enter name to login"
              variant="outlined"
              className="bg-text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <br />
            <Button
              variant="contained"
              color="primary"
              onClick={handleClickButtonLogin}
            >
              login
            </Button>
          </div>
        </React.Fragment>
      )}
      {open && (
        <Dialog fullScreen open={true} TransitionComponent={Transition}>
          <AppBar>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  setOpen(false);
                }}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h6">{friendName}</Typography>
            </Toolbar>
          </AppBar>
          <br />
          <br />
          <br />
          <div className="chat-bubbles">
            {msgs != null &&
              msgs.map((msg) =>
                msg.id === uid ? (
                  <>
                    <div className="mine">{msg.text}</div>
                  </>
                ) : (
                  <>
                    <div className="your">{msg.text}</div>
                  </>
                )
              )}
          </div>
          <div className="chat-input">
            <TextField
              className="input-main"
              value={userMsg}
              label="enter msg"
              onChange={(e) => {
                setUserMsg(e.target.value);
              }}
            />
            <Button
              onClick={() => {
                handleButtonClick();
              }}
              variant="contained"
              color="primary"
            >
              send
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default App;
