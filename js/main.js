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
const userscollection = db.collection('users');

// -------------firebase関連ここまで-------------


// ユーザー情報を入れる変数
let me = null;
let username = '';
let userID = '';

// 要素の取得
const message = document.getElementById('message');
const form = document.querySelector('form');
const messages = document.getElementById('messages');
const overScreen = document.getElementById('over-screen');
const login = document.getElementById('login');
const logout = document.getElementById('logout');


// -------------関数ここから-------------

// ユニークなIDを作る関数
function getUniqueStr(myStrong){
  var strong = 1000;
  if (myStrong) strong = myStrong;
  return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
}

// 削除処理
function deleteMessage(self) {
  const messageID = self.getAttribute('data-id');
  collection.doc(messageID).delete().then(function() {
    console.log("Document successfully deleted!");
  }).catch(function(error) {
    console.error("Error removing document: ", error);
  });
};

  // 現在日時の取得
  function getTime() {
    const time = new Date();
    const messageDateTime = time.getHours() + ":" + String(time.getMinutes()).padStart(2, "0");
    return messageDateTime;
  }

// -------------関数ここまで-------------

//ストレージの定義
const storage = localStorage;

// もしローカルストレージにユーザー名があればユーザー名を入れる
if (storage.ogachatname !== undefined) {
  username = storage.ogachatname;
  userID = storage.ogachatID;
}


// ログインボタンを押した時の処理
login.addEventListener('click', () => {
  // ユーザーネームが空なら名前を入力してもらう
  if (username === '' || storage.getItem('ogachatname') === null) {
    username = prompt('好きな名前を入力してください', 'ゲストユーザー');
    if (username === null || username === '') {
      username = '名無しのコード書き';
    }  
    userID = getUniqueStr();
    storage.setItem('ogachatname', username);
    storage.setItem('ogachatID', userID);
  }

  console.log(`ログインしました`);

  // 表示非表示の処理
  login.classList.add('hidden');
  overScreen.classList.add('hidden');
  [logout, form, messages].forEach(el => {
    el.classList.remove('hidden');
  });
  
  // ログインログの保存
  userscollection.doc(userID).set({
    // サーバー側のタイムスタンプを取得
    created: firebase.firestore.FieldValue.serverTimestamp(),
    // ログインユーザー情報の保存
    username: username,
    userID: userID,
  })
  .then(doc => {
    console.log(`ログインログ added!`);
  })
  .catch(error => {
    console.log('document add error!');
    console.log(error);
  });


  collection.add({
    message: username + 'が参加しました。',
    // サーバー側のタイムスタンプを取得
    created: firebase.firestore.FieldValue.serverTimestamp(),
    username: 'enter',
    userID: userID,
    messageDateTime: getTime()
  })
  .then(doc => {
    console.log(`ログインメッセージ added!`);
  })
  .catch(error => {
    console.log('document add error!');
    console.log(error);
  });

});


// ログアウトボタンを押した時の処理
logout.addEventListener('click', () => {

  // 表示非表示の切り替え
  console.log('ログアウトしました');
  login.classList.remove('hidden');
  overScreen.classList.remove('hidden');
  [logout, form, messages].forEach(el => {
    el.classList.add('hidden');
  });

  // ログインしているユーザーデータを削除
  userscollection.doc(userID).delete().then(function() {
    console.log("ログインログ deleted!");
  }).catch(function(error) {
      console.error("Error removing document: ", error);
  });

  
  collection.add({
    message: username + 'が退室しました。',
    // サーバー側のタイムスタンプを取得
    created: firebase.firestore.FieldValue.serverTimestamp(),
    username: 'enter',
    userID: userID,
    messageDateTime: getTime()
  })
  .then(doc => {
    console.log(`ログアウトメッセージ added!`);
  })
  .catch(error => {
    console.log('document add error!');
    console.log(error);
  });

});


// ログイン中のユーザー数をカウントして表示
userscollection.onSnapshot(snapshot => {
  document.getElementById('user-counter').innerHTML = snapshot.docs.length;
});


// 変更があったら'created'でソートして画面に表示
collection.orderBy('created').onSnapshot(snapshot => {
  
  snapshot.docChanges().forEach(change => {
    if (change.type === 'removed') {
      const d = change.doc.data();

      document.getElementById(change.doc.id).innerHTML = '<p>'+ d.messageDateTime +'</p><p>'+ d.username +'がメッセージの送信を取り消しました</p>';
      document.getElementById(change.doc.id).classList.add('delete-message')
      ;
    }
    
    if (change.type === 'added') {
      const li = document.createElement('li');
      const d = change.doc.data();
      li.setAttribute('id', change.doc.id);

      // 自分のメッセージじゃなかったら'another'クラスを追加
      if (change.doc.data().userID !== storage.getItem('ogachatID')) {
        li.classList.add('another');
      }

      // ユーザーネームがenterだったらクラスを追加
      if (change.doc.data().username === 'enter') {
        li.classList.add('enter');
      }
      li.innerHTML = `<p class="username">${d.username}</p><p class="message">${d.message}</p><p class="message-date-time">${d.messageDateTime}</p>`;

      // 自分のメッセージだったら削除ボタンを追加
      if (change.doc.data().userID === storage.getItem('ogachatID') && change.doc.data().username !== 'enter') {
        li.innerHTML += '<i class="delete-con fas fa-trash-alt" data-id="'+ change.doc.id +'" onclick="deleteMessage(this);" style="width: 100%; text-align: right;"></i>';
      }

      messages.appendChild(li);
      // 削除アイコン隠しておく
      $('.delete-con').hide();

      // メッセージを下までスクロール
      const element = document.getElementById('messages');
      element.scroll({
        top:element.scrollHeight, 
        behavior:"smooth"
      });
    }
  });
});

// 常にテキストボックスにフォーカス
message.focus();


// 飛行機マークを押した時の処理
document.getElementById('send-btn').addEventListener('click', (e) => {

  // ページ遷移しないようにする
  e.preventDefault();

  const val = message.value.trim();
  
  // 空文字だったら処理を止める
  if (val === '') {
    return;
  }

  // ボックスを空にしてフォーカスを当てる
  message.value = '';
  message.focus();

  // データの保存
  collection.add({
    message: val,
    // サーバー側のタイムスタンプを取得
    created: firebase.firestore.FieldValue.serverTimestamp(),
    username: username,
    userID: userID,
    messageDateTime: getTime()
  })
  .then(doc => {
    console.log(`通常メッセージ added!`);
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


  // ボックスを空にしてフォーカスを当てる
  message.value = '';
  message.focus();

  // データの保存
  collection.add({
    message: val,
    // サーバー側のタイムスタンプを取得
    created: firebase.firestore.FieldValue.serverTimestamp(),
    username: username,
    userID: userID,
    messageDateTime: getTime()
  })
  .then(doc => {
    console.log(`通常メッセージ added!`);
  })
  .catch(error => {
    console.log('document add error!');
    console.log(error);
  });
});



// 削除ボタンを出す
$('#delete-trigger').on('click', () => {
  $('.delete-con').fadeToggle(500);
});


// 名前変更処理
$('#chage-name-trigger').on('click', () => {
  const oldName = storage.getItem('ogachatname');
  username = prompt('新しい名前を入力してください', oldName);
  if (username === null || username === '') {
    username = '名無しのコード書き';
  }
  storage.setItem('ogachatname', username);
  alert('名前が変更されました')
  collection.add({
    message: oldName + 'が' + username + 'に名前を変更しました。',
    // サーバー側のタイムスタンプを取得
    created: firebase.firestore.FieldValue.serverTimestamp(),
    username: 'enter',
    userID: userID,
    messageDateTime: getTime()
  })
  .then(doc => {
    console.log(`名前変更メッセージ added!`);
  })
  .catch(error => {
    console.log('document add error!');
    console.log(error);
  });

});

// ブラウザバック禁止
history.pushState(null, null, location.href);
window.addEventListener('popstate', (e) => {
  history.go(1);
});

// リロード時の処理
window.addEventListener('beforeunload', function(e){
  /** 更新される直前の処理 */
  var message = '本当に更新してよろしいですか？';
  e.returnValue = message;
  return message;
  
});
