const firebase = require('firebase');
require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyDw-qJvzgcPfY-B_2ggxEi8noIFkyQqHRw",
    authDomain: "hello-world-aa406.firebaseapp.com",
    projectId: "hello-world-aa406",
    storageBucket: "hello-world-aa406.appspot.com",
    messagingSenderId: "1094062716223",
    appId: "1:1094062716223:web:8b771e405d8c3dc6f10f8a",
    measurementId: "G-XHWB8SCHN9"
}
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase