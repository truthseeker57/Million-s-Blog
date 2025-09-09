import axios from 'axios'

const baseURL = 'http://localhost:3001/'


const getAll = (collection) => {
    const req = axios.get(`${baseURL}${collection}`)
    return req.then(response => response.data) 
}

const createPost = (collection, post) => {
    const req = axios.post(`${baseURL}${collection}`, post)
    return req.then(response => response.data)
}

const editPost = (collection, post, newItem) => {
    const req = axios.put(`${baseURL}${collection}/${post}`, newItem)
    return req.then(response => response.data)
}

const deletePost = (collection, postId) => {
    const req = axios.delete(`${baseURL}${collection}/${postId}`)
    return req.then(response => response.data)
}

const deleteAll = async (collection) => {
  const { data } = await axios.get(`${baseURL}${collection}`);
  await Promise.all(data.map(item => axios.delete(`${baseURL}${collection}/${item.id}`)));
};


export default { getAll, createPost, editPost, deletePost, deleteAll }