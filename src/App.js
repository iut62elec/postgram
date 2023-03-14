import './App.css';
import React, {useState, useEffect, useRef} from 'react';
import {Amplify, API, graphqlOperation} from 'aws-amplify'
import { Flex, View, Heading, MapView, Text, Image,  withAuthenticator,AmplifyS3Image } from '@aws-amplify/ui-react';
import config from './aws-exports'
import { listPosts } from './graphql/queries'
Amplify.configure(config)





function App() {
  const [posts, setPosts] = useState ([]);
  useEffect(()=>{
    API.graphql(graphqlOperation(listPosts))
    .then(response => setPosts(response.data.listPosts.items))
    .then(error => console.log(error))
  },[]);

  
  return (
    <div>
      <h1>Hello World</h1>
      {
        posts.map(post => (
          <div key={post.id}>
            <h3>{post.name}</h3>
            <p>{post.location}</p>
          </div>
        ))
      }
    </div>
  );
}

export default App;
