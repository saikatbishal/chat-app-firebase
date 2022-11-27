// import React from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useState, useRef } from 'react';
import './style/App.css'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
// console.log(process.env.REACT_APP_API_KEY)

firebase.initializeApp({
  // your config
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: "chatt-app-saikat.firebaseapp.com",
  projectId: "chatt-app-saikat",
  storageBucket: "chatt-app-saikat.appspot.com",
  messagingSenderId: "342538223104",
  appId: "1:342538223104:web:2ffa6388d5b37a24cca2e5",
  measurementId: "G-1RK0Q2Q0K8"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


const App = () => {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>CHAT APP</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  )
}
const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <div>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      <p className="rules">Do not violate the community guidelines or you will be banned for life!</p>

    </div>
  )
}
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>
      <form onSubmit={sendMessage}>

        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

        <button type="submit" disabled={!formValue}>▶</button>

      </form>
    </>)
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}
function DeleteMessage(uid) {
  firebase.firestore().collection("messages").where("uid", "==", uid).get()
    .then(querySnapshot => {
      querySnapshot.docs[0].ref.delete();
    });
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved';
  return (
    <div className={`message ${messageClass}`}>
      {(uid === auth.currentUser.uid) && <button className="delete" onClick={() => DeleteMessage(uid)}>⛔</button>}
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.pnghttps://cdn0.iconfinder.com/data/icons/user-pictures/100/unknown_1-2-512.png'} alt="" />
      <p>{text}</p>
    </div>

  )
}
export default App