import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { auth,database  } from '../firebase'; 
import { useQuery } from '@tanstack/react-query';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, set, update,get,onValue } from 'firebase/database';
function ChatComponent() {

  const [currentUser, setCurrentUser] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.email);
        localStorage.setItem('currentUser', user.email);
       // setMessages([{ sender: 'System', text: `Welcome back, ${user.email}` }]);
      } else {
        promptAuth();
      }
    });

    return () => unsubscribe();
  }, []);

  const promptAuth = () => {
    Swal.fire({
      title: 'Welcome!',
      text: 'Login or Register to continue',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Login',
      cancelButtonText: 'Register',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        promptLogin();
      } else {
        promptRegister();
      }
    });
  };

const promptLogin = () => {
  Swal.fire({
    title: 'Login',
    html:
      '<input id="swal-email" class="swal2-input" placeholder="Email">' +
      '<input id="swal-password" type="password" class="swal2-input" placeholder="Password">',
    confirmButtonText: 'Login',
    preConfirm: async () => {
      const email = document.getElementById('swal-email').value;
      const password = document.getElementById('swal-password').value;

      if (!email || !password) {
        Swal.showValidationMessage('Both fields are required');
        return false;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update last login timestamp
        await update(ref(database, `users/${user.uid}`), {
          lastLogin: new Date().toISOString()
        });

        return { email: user.email };
      } catch (error) {
        Swal.showValidationMessage(error.message);
        return false;
      }
    },
  }).then((result) => {
    if (result.value) {
      setCurrentUser(result.value.email);
      localStorage.setItem('currentUser', result.value.email);
      setMessages([{ sender: 'System', text: `Welcome back, ${result.value.email}!` }]);
    }
  });
};


const promptRegister = () => {
  Swal.fire({
    title: 'Register',
    html:
      '<input id="swal-new-email" class="swal2-input" placeholder="Email">' +
      '<input id="swal-new-password" type="password" class="swal2-input" placeholder="Password">',
    confirmButtonText: 'Register',
    preConfirm: async () => {
      const email = document.getElementById('swal-new-email').value;
      const password = document.getElementById('swal-new-password').value;

      if (!email || !password) {
        Swal.showValidationMessage('Both fields are required');
        return false;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = {
          email: user.email,
          uid: user.uid,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        await set(ref(database, `users/${user.uid}`), userData);

        return { email: user.email };
      } catch (error) {
        Swal.showValidationMessage(error.message);
        return false;
      }
    },
  }).then((result) => {
    if (result.value) {
      setCurrentUser(result.value.email);
      localStorage.setItem('currentUser', result.value.email);
      setMessages([{ sender: 'System', text: `Welcome, ${result.value.email}!` }]);
    }
  });
};
const handleLogout = async () => {
  await auth.signOut();
  setCurrentUser('');
  localStorage.removeItem('currentUser');
  window.location.reload(); // or redirect if you want
};

const { data: users, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const snapshot = await get(ref(database, 'users'));
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    const userList = Object.values(data).map((u) => u.email);

    return userList;
  },
});


queryFn: async () => {
  const snapshot = await get(ref(database, 'users'));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  console.log('Fetched users:', data); // 👈 debug
  return Object.values(data).map((u) => u.email);
}


  const handleSend = () => {
    if (input.trim() === '') return;
    setMessages([...messages, { sender: currentUser, text: input }]);
    setInput('');
  };





  
if (!currentUser) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Authenticating...</h2>
    </div>
  );
}


return (
  <div style={styles.mainContainer}>
  {/* Left Panel - Users */}
<div style={styles.userList}>
  <div style={styles.userHeader}>Users</div>
  <div style={styles.userListContent}>
    {isLoading ? (
      <div style={styles.darktext}>Loading...</div>
    ) : !users || users.length === 0 ? (
      <div style={styles.darktext}>No users found</div>
    ) : users.filter((email) => email !== currentUser).length === 0 ? (
      <div style={styles.darktext}>No other users</div>
    ) : (
      users
        .filter((email) => email !== currentUser)
        .map((email, index) => (
          <div key={index} style={styles.userItem}>
            {email}
          </div>
        ))
    )}
  </div>
</div>


 

    {/* Right Panel - Chat */}
    <div style={styles.chatContainer}>
  <div style={styles.header}>
  <span>Messenger - {currentUser}</span>
  <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
</div>


      <div style={styles.messages}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.sender === currentUser ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === currentUser ? '#DCF8C6' : '#FFF',
              color: '#222',
            }}
          >
            <span style={styles.sender}>{msg.sender}:</span>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>

      <div style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} style={styles.sendButton}>Send</button>
      </div>
    </div>
  </div>
);

}

const styles = {
darktext:{
  color: '#000',
},
logoutButton: {
  marginLeft: 'auto',
  backgroundColor: '#fff',
  color: '#0084FF',
  border: '1px solid #0084FF',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '12px'
},

  mainContainer: {
    display: 'flex',
    width: '1000px',
    height: '1000px',
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #ccc',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  userList: {
    width: '150px',
    backgroundColor: '#f5f5f5',
    borderRight: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
  },
  userHeader: {
    backgroundColor: '#0084FF',
    color: '#fff',
    padding: '10px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  userListContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
  },
  userItem: {
    padding: '8px',
    borderRadius: '6px',
    backgroundColor: '#fff',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#000',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#0084FF',
    color: '#fff',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '20px',
    textAlign: 'center',
  },
  messages: {
    flex: 1,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
    backgroundColor: '#F0F0F0',
    fontSize: '16px',
  },
  message: {
    maxWidth: '70%',
    padding: '12px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    lineHeight: '1.4',
  },
  sender: {
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '6px',
    color: '#444',
  },
  inputArea: {
    display: 'flex',
    borderTop: '1px solid #ccc',
  },
  input: {
    flex: 1,
    padding: '14px',
    fontSize: '16px',
    border: 'none',
    outline: 'none',
  },
  sendButton: {
    padding: '14px 18px',
    border: 'none',
    backgroundColor: '#0084FF',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },


};


export default ChatComponent;
