'use strict';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSObIsDPKsFJra7Vc7wAFTkmpZle_yKzs",
  authDomain: "oga-chan-72eef.firebaseapp.com",
  databaseURL: "https://oga-chan-72eef.firebaseio.com",
  projectId: "oga-chan-72eef",
  storageBucket: "oga-chan-72eef.appspot.com",
  messagingSenderId: "865326050426",
  appId: "1:865326050426:web:62202013dbceffd2321fc3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// firestoreを使えるようにする、変数にする
const db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true
});
const collection = db.collection('messages');
const auth = firebase.auth();


// ユーザー情報を入れる変数
let me = null;
let username = '';
let userID = '';

// ユニークなIDを作る関数
function getUniqueStr(myStrong){
  var strong = 1000;
  if (myStrong) strong = myStrong;
  return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
}

//ストレージの定義
const storage = localStorage;

// もしローカルストレージにユーザー名があればユーザー名を入れる
if (storage.ogachatname !== undefined) {
  username = storage.ogachatname;
  userID = storage.ogachatID;
}

// ユーザーネームが空なら名前を入力してもらう
if (username === '') {
  username = prompt('好きな名前を入力してください', 'ゲストユーザー');
  userID = getUniqueStr();
  storage.setItem('ogachatname', username);
  storage.setItem('ogachatID', userID);
}
console.log(username);
console.log(userID);

// 要素の取得
const message = document.getElementById('message');
const form = document.querySelector('form');
const messages = document.getElementById('messages');
const login = document.getElementById('login');
const logout = document.getElementById('logout');

// 削除処理
function deleteMessage(self) {
  const messageID = self.getAttribute('data-id');
  collection.doc(messageID).delete().then(function() {
    console.log("Document successfully deleted!");
  }).catch(function(error) {
    console.error("Error removing document: ", error);
  });
};


// ログインボタンを押した時の処理
login.addEventListener('click', () => {
  auth.signInAnonymously();
});
// ログアウトボタンを押した時の処理
logout.addEventListener('click', () => {
  auth.signOut();
});
// ログイン状態の監視
auth.onAuthStateChanged(user => {
  // ユーザーの値を使って条件分岐
  if (user) {
    me = user;

    // messages の最初の子要素が存在する限り messages から messages の最初の子要素を削除していく
    while (messages.firstChild) {
      messages.removeChild(messages.firstChild);
    }

    // 'created'でソートして画面に表示
    collection.orderBy('created').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'removed') {
          // 現在日時の取得
          const time = new Date();
          const date2 = time.getHours() + ":" + String(time.getMinutes()).padStart(2, "0");
          const messageDateTime = date2;

          document.getElementById(change.doc.id).innerHTML = '<p>'+ date2 +'</p><p>メッセージの送信を取り消しました</p>';
          document.getElementById(change.doc.id).classList.add('delete-message')
          ;
        }
        if (change.type === 'added') {
          const li = document.createElement('li');
          const d = change.doc.data();
          li.setAttribute('id', change.doc.id);
          li.innerHTML = `<p class="username">${d.username}</p><p class="message">${d.message}</p><p class="message-date-time">${d.messageDateTime}</p>`;

          // 自分のメッセージだったら削除ボタンを追加
          if (change.doc.data().userID === storage.getItem('ogachatID')) {
            li.innerHTML += '<button data-id="'+ change.doc.id +'" onclick="deleteMessage(this);">削除</button>';
          }

          if (change.doc.data().userID !== storage.getItem('ogachatID')) {
            li.classList.add('another');
          }

          messages.appendChild(li);

          // メッセージを下までスクロール
          const element = document.getElementById('messages');
          element.scroll({
            top:element.scrollHeight, 
            behavior:"smooth"
          });
        }
      });
    }, error => {});
    console.log(`Logged in as: ${user.uid}`);
    login.classList.add('hidden');
    [logout, form, messages].forEach(el => {
      el.classList.remove('hidden');
    });
    message.focus();
    return;
  }
  // ログアウトした時の処理
  me = null;
  console.log('Nobody is logged in');
  login.classList.remove('hidden');
  [logout, form, messages].forEach(el => {
    el.classList.add('hidden');
  });
});




document.getElementById('send-btn').addEventListener('click', (e) => {

  // ページ遷移しないようにする
  e.preventDefault();

  const val = message.value.trim();
  
  // 空文字だったら処理を止める
  if (val === '') {
    return;
  }

  // 現在日時の取得
  const time = new Date();
  const date2 = time.getHours() + ":" + String(time.getMinutes()).padStart(2, "0");
  const messageDateTime = date2;

  // ボックスを空にしてフォーカスを当てる
  message.value = '';
  message.focus();

  // データの保存
  collection.add({
    message: val,
    // サーバー側のタイムスタンプを取得
    created: firebase.firestore.FieldValue.serverTimestamp(),
    // ログインユーザー情報の保存
    uid: me ? me.uid : 'nobody',
    username: username,
    userID: userID,
    messageDateTime: messageDateTime
  })
  .then(doc => {
    console.log(`${doc.id} added!`);
  })
  .catch(error => {
    console.log('document add error!');
    console.log(error);
  });

});
// フォームを送信した時の処理
form.addEventListener('submit', e => {

  // ページ遷移しないようにする
  e.preventDefault();

  const val = message.value.trim();
  
  // 空文字だったら処理を止める
  if (val === '') {
    return;
  }

  // 現在日時の取得
  const time = new Date();
  const date2 = time.getHours() + ":" + String(time.getMinutes()).padStart(2, "0");
  const messageDateTime = date2;

  // ボックスを空にしてフォーカスを当てる
  message.value = '';
  message.focus();

  // データの保存
  collection.add({
    message: val,
    // サーバー側のタイムスタンプを取得
    created: firebase.firestore.FieldValue.serverTimestamp(),
    // ログインユーザー情報の保存
    uid: me ? me.uid : 'nobody',
    username: username,
    userID: userID,
    messageDateTime: messageDateTime
  })
  .then(doc => {
    console.log(`${doc.id} added!`);
  })
  .catch(error => {
    console.log('document add error!');
    console.log(error);
  });
});

