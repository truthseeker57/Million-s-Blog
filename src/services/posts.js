import axios from 'axios'

const baseURL = 'http://localhost:3001/posts'


const getAll = () => {
    const req = axios.get(baseURL)
    return req.then(response => response.data) 
}

const createPost = (post) => {
    const req = axios.post(baseURL, post)
    return req.then(response => response.data)
}

const editPost = (post, newItem) => {
    const req = axios.put(`${baseURL}/${post}`, newItem)
    return req.then(response => response.data)
}

const deletePost = (postId) => {
    const req = axios.delete(`${baseURL}/${postId}`)
    return req.then(response => response.data)
}


export default { getAll, createPost, editPost, deletePost }