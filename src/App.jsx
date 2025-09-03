import { useState } from 'react';
import { FaTrash } from "react-icons/fa"
import { BiBookOpen } from "react-icons/bi"; 
import './App.css';
import DecryptedText from './components/DecryptedText';
import Squares from './components/Squares.jsx';
import ComposerModal from './components/ComposerModal.jsx'
import ReadModal from './components/ReadModal.jsx'

  

const Navigation = () => {
  return (
    <nav className="nav">
      <span className="path">C:\\BLOG&gt;</span>
      <a href="#">posts</a>
      <a href="#">archive</a>
      <a href="#">shower_thoughts</a>
      <a href="#">about</a>
    </nav>
  );
};

const Search = ({ onChange }) => {
  return (
    <div className="search">
      <input
        className="search-input"
        placeholder="/ Search posts..."
        onChange={onChange}
      />
      <span className="hint">/</span>
      <span className="hint">Ctrl+K</span>
    </div>
  );
};

const PostItem = ({ posts, onDelete, onRead }) => {
  return (
    <div>
      {posts.map((post) => (
<div className="post-block" key={post.id}>
  <div className="post-header">
    <DecryptedText text={post.title} /> &nbsp; &nbsp; &nbsp; &nbsp;
    {post.date} &nbsp; {post.time} &nbsp; {post.read} &nbsp;
  </div>
  <div className="divider">----------------------------------------------------------------</div>
  <p className="post-excerpt">{post.excerpt}</p>
  <div className="meta">
    Tags : {post.tags.join(', ')} <br />
    Likes: ♥ {post.likes} &nbsp; Comments: {post.comments}
  </div>
  <div className="divider">----------------------------------------------------------------</div>

  {/* delete button now at bottom-right */}
  <div className="post-actions">
     <button className="post-action-btn read" onClick={() => onRead(post.id)} aria-label="Read post">
  <BiBookOpen />
</button>
 <button className="post-action-btn del" onClick={() => onDelete(post.id)} aria-label="Delete post">
  <FaTrash />
</button>
  </div>
</div>

      ))}
    </div>
  );
};

/* ---------- App ---------- */

export default function App() {
  const [posts, setPosts] = useState([
{
  id: 1,
  title: 'DEPLOYING-A-SPRING-API.TXT',
  date: '07/30/2025',
  time: '03:22 PM',
  read: '6MIN',
  content: `
When you finish building a Spring Boot API, the next step is deployment. Deployment is about making your application accessible to users, whether on the cloud, a server, or locally within an organization. Here are the common steps and options for deploying a Spring API:

1. Build the Application
Use Maven or Gradle to package your app.

Example:

bash
Copy
Edit
mvn clean package
This generates a JAR (or WAR) file inside the target directory.

2. Run as a Standalone JAR
Spring Boot comes with an embedded server (Tomcat by default), so you can run it directly:

bash
Copy
Edit
java -jar target/my-api-0.0.1-SNAPSHOT.jar
3. Deploy on a Server
If you’re using an application server like Tomcat or WildFly, package as a WAR and drop it in the server’s webapps folder.

4. Use Docker for Deployment
Containerization makes deployment easier across environments.

Create a Dockerfile:

dockerfile
Copy
Edit
FROM openjdk:17-jdk-slim
COPY target/my-api-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
Build and run:

bash
Copy
Edit
docker build -t my-spring-api .
docker run -p 8080:8080 my-spring-api
5. Deploy to Cloud Platforms
AWS Elastic Beanstalk: Upload JAR/WAR and let AWS handle scaling.

Heroku: Push code with Git and add a Procfile to run the app.

Google Cloud Run / Kubernetes: Deploy Docker images for auto-scaling APIs.

Azure App Service: Deploy using Maven or Docker directly.

6. Configure Environment Variables
Instead of hardcoding, store sensitive info like DB credentials or API keys in environment variables or config files. Example for Linux:

bash
Copy
Edit
export SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/mydb
7. Database Migrations
Use tools like Flyway or Liquibase to handle schema updates during deployment.

8. Monitoring & Logging
Enable Spring Actuator for health checks and metrics.

Centralize logs using ELK stack, CloudWatch, or other monitoring tools.

Conclusion
Deploying a Spring API can be as simple as running a JAR on a server or as advanced as orchestrating containers in Kubernetes. Choose the method that fits your project’s scale and infrastructure. With proper packaging, configuration, and monitoring, your Spring API will be production-ready.
  `,
  excerpt: 'Step-by-step walkthrough of deploying a Spring Boot API to a production server, including build configs, Docker, and CI/CD basics.',
  tags: ['SPRING', 'API'],
  likes: 17,
  comments: 6,
}
,
    {
      id: 2,
      title: 'REACT-HOOKS-FOR-NOTES.TXT',
      date: '08/12/2025',
      time: '11:10 AM',
      read: '7MIN',
      content:`React Hooks provide a powerful and elegant way to build a notes application using functional components instead of relying on class components. The main advantage of hooks is that they simplify state management and side effects while keeping code clean and reusable.

The most commonly used hook for a notes app is useState, which helps store and update individual notes or an array of notes. For example, when a user types a new note, useState allows you to capture the input and append it to the notes list. Alongside this, useEffect can be used to handle side effects such as saving notes to local storage so that data is not lost when the page refreshes. By combining these two hooks, developers can easily provide persistence and responsiveness to their notes application.

For more complex scenarios, useReducer is a great option. It allows managing multiple note-related actions such as adding, editing, and deleting with a single state logic handler. This keeps the code organized and easier to scale as the app grows. If the notes app has multiple components (like a note editor, a notes list, and filters), useContext can be used to share data and state globally without passing props manually through every level of the component tree.

In addition, custom hooks can be created to encapsulate repeated logic. For instance, a custom hook for “useLocalStorage” can automatically synchronize notes with the browser’s storage. This makes the app more modular and keeps the main component focused only on rendering and interactions.

By leveraging React Hooks, developers can build a notes app that is lightweight, efficient, and easy to maintain. Hooks not only improve code readability but also encourage reusable patterns, making them one of the most effective tools in modern React development.`,
      excerpt: `Explaining a simple system for managing project
notes in React using custom hooks. Lightweight,
scalable, and great for dev journals.`,
      tags: ['REACT'],
      likes: 11,
      comments: 2
    },
        {
      id: 3,
      title: 'HOW-I-DESIGNED-A-TERMINAL-UI.TXT',
      date: '08/28/2025',
      time: '06:32 PM',
      read: '6MIN',
      content: `Designing a terminal UI is a unique challenge because the interface has no graphics, only text. My goal was to make it both functional and visually appealing within the constraints of a command-line environment. The first step was to define the structure: I decided on a clear layout with sections for menus, status bars, and user input. Using spacing, borders, and ASCII characters, I created visual separation between these parts.

I focused on usability first. Key commands had to be intuitive, so I mapped them to simple keyboard shortcuts. Consistency was important—if one action used a certain key combination, similar actions followed the same pattern. I also included feedback for every action, such as status messages or highlighting changes in real time.

Another important part of the design was color. Even in a terminal, colors can guide the user’s attention. For example, green for success, red for errors, and yellow for warnings. Careful use of colors made the interface feel more alive and easier to navigate.

Lastly, I kept the design modular. Each component (menu, input box, output window) was developed separately so that the UI could scale or adapt later. This modular approach also made the code easier to maintain and extend with new features.

Overall, designing the terminal UI taught me that even without graphics, you can create a clean, user-friendly interface by focusing on structure, usability, feedback, and modularity.`,
      excerpt: `A write-up about designing a terminal-inspired UI
without sacrificing readability. Covers font sizes,
line lengths, and layout tricks for blogs.`,
      tags: ['REACT', 'UI'],
      likes: 23,
      comments: 4
    }
  ])

  const [query, setQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const[isReadModalOpen, setIsReadModalOpen] = useState(false)
  const[selectedPost, setSelectedPost] = useState({})
  const [formData, setFormData] = useState({
    title:'',
    excerpt:'',
    tags:'',
    content:'',
  })

  const handleSearch = (event) => {
    const searchedItem = event.target.value.toLowerCase();
    setQuery(searchedItem);
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchedItem) 
    );
    setPosts(filtered);
  }



  const deletePost = (id) => {
  setPosts((prev) => prev.filter((p) => p.id !== id));
};

const readPost = (id) => {
  setSelectedPost(posts.find(post => post.id == id))
  setIsReadModalOpen(true)
}

const handleNewPost = () => {
  setIsComposerOpen(true)
  setFormData({
    title:'',
    excerpt:'',
    tags:'',
    content:'',
  })
}

const handleModalClose = () => {
  setIsComposerOpen(false)
  setIsReadModalOpen(false)
  setSelectedPost({})
}

const handleModalSubmit = (e) => {
  e.preventDefault()

  const now = new Date()
  const date = now.toLocaleDateString('en-US')
  const time = now.toLocaleTimeString('en-US', {
    hour:'2-digit',
    minute: '2-digit',
  })

  const words = formData.content.trim().split(/\s+/).length / 225
  const read = `${Math.max(1, Math.ceil(words/200))}MIN`

const tagArray = (formData.tags || '')
.split('.')
.map(i => i.trim())
.filter(Boolean)
.map(i => i.toUpperCase())

const tags = Array.from(new Set(tagArray))

  const newPost = {
    id: now, 
    title: formData.title || 'Untitled',
    date: date,
    time: time,
    read: read,
    excerpt: formData.excerpt || formData.content.slice(0, 250),
    content: formData.content,
    tags: tags,
    likes: 0,
    comments:0
  }

  setPosts(prev => ([...prev, newPost]))
  setIsComposerOpen(false)
}

  return (
    <>
    <ComposerModal isOpen={isComposerOpen} onClose={handleModalClose} formData={formData} setFormData={setFormData} onSubmit={handleModalSubmit}/>
    <ReadModal isOpen={isReadModalOpen} onClose={handleModalClose} post={selectedPost}/>

  {/* animated background */}
  <div className="bg">
    <Squares
      speed={0.5}
      squareSize={40}
      direction="right"   // 'up' | 'down' | 'left' | 'right' | 'diagonal'
      borderColor="#21571fff"
    />
  </div>
      <header className="topbar">
        <h2 className="brand">
          <DecryptedText
            text={`C:\\\\Million's log> dir`}
          />
        </h2>
        <div className="toolbar">
          <Navigation />
          <Search onChange={handleSearch} />
        </div>
      </header>

      <main className="container">
<div className="post-toolbar">
  <div className="post-action new-post" onClick={handleNewPost}>
    <span className="new-icon">+</span> New
  </div>
  <div className="post-action">Drafts</div>
  <div className="post-action">Trash</div>
  <div className="post-action">Export</div>
</div>
        <PostItem posts={posts} onDelete={deletePost} onRead={readPost}/>
        {posts.length === 0 && (
          <p className="empty">No matches for “{query}”.</p>
        )}
      </main>
    </>
  );
}
