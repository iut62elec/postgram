import './App.css';
import '@aws-amplify/ui-react/styles.css';
import {
  HashRouter,
  Switch,
  Route
} from "react-router-dom";
import React, {useState, useEffect, useRef} from 'react';
import {Amplify, API, Auth, graphqlOperation, Storage} from 'aws-amplify'
import { Flex, View, Heading, MapView, Text, Image,  withAuthenticator, AmplifyS3Image } from '@aws-amplify/ui-react';
import config from './aws-exports'
import { listPosts } from './graphql/queries'
import CreatePost from './CreatePost';
import { Link } from 'react-router-dom';
import { css } from '@emotion/css';
import Post from './Post';


Amplify.configure(config)





function Router({ signOut, user }) {
  const [posts_ped, setPosts_ped] = useState ([]);
  //const file = e.target.files[0];

  /* create a couple of pieces of initial state */
  const [showOverlay, updateOverlayVisibility] = useState(false);
  const [posts, updatePosts] = useState([]);


  useEffect(()=>{
    API.graphql(graphqlOperation(listPosts))
    .then(response => setPosts_ped(response.data.listPosts.items))
    .then(error => console.log(error))
    
  },[]);
  console.log(posts)
  useEffect(() => {
    Auth.currentAuthenticatedUser()
    .then(response => console.log(response.attributes.email))
    .then(error => console.log(error))

  },[])
  

   /* fetch posts when component loads */
   useEffect(() => {
    fetchPosts();
    }, []);

    
async function fetchPosts() {

  /* query the API, ask for 100 items */
  let postData = await API.graphql({ query: listPosts, variables: { limit: 100 }});
  let postsArray = postData.data.listPosts.items;

  /* map over the image keys in the posts array, get signed image URLs for each image */
  postsArray = await Promise.all(postsArray.map(async post => {
    const imageKey = await Storage.get(post.image);
    post.image = imageKey;
    return post;
  }));

  /* update the posts array in the local state */
  setPostState(postsArray);
}

async function setPostState(postsArray) {
  updatePosts(postsArray);
}
const imageStyle = css`
  width: 100%;
  max-width: 400px;
`
const postContainer = css`
  border-radius: 10px;
  padding: 1px 20px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  \:hover {
    border-color: #0070f3;
  }
`  

const postTitleStyle = css`
  margin: 15px 0px;
  color: #0070f3;
`
const linkStyle = css`
  text-decoration: none;
`
//const id ="017141f1-48d7-4ba7-b382-49b584956259"

  return (

    <>
      <HashRouter>


    <div>
      <h1>Hello World</h1>
      <button onClick={() => updateOverlayVisibility(true)}>New Post</button>
      <Switch>  
        <Route exact path="/" >
        {
          posts.map(post => (
            <Link to={`/post/${post.id}`} className={linkStyle} key={post.id}>
            <div key={post.id} className={postContainer} >
              <h3 className={postTitleStyle}>{post.name} </h3>
              <p>{post.location}</p>
              <img alt="post" className={imageStyle}  src={post.image} />
            </div>
            </Link>
          ))
        }
        </Route>
        <Route path="/post/:id" >
                <Post />
        </Route>

       </Switch>
      </div>
      <button onClick={signOut}>Sign Out</button>
 
      </HashRouter>
      {showOverlay && (
      <CreatePost
            updateOverlayVisibility={updateOverlayVisibility}
            updatePosts={setPostState}
            posts={posts}
      />
      )}
      
    
    </>
  );
}

export default withAuthenticator(Router);
