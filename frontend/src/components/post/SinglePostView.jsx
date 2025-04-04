import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const SinglePostView = () => {
  const { id } = useParams(); // Gets the post ID from the URL
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:8081/api/posts/${id}`)
      .then((response) => setPost(response.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch the post.");
      });
  }, [id]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!post) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-semibold mb-4">Post Details</h2>
      
      {post.mediaUrl && (
        <img
          src={`http://localhost:8081${post.mediaUrl}`}
          alt="Post media"
          className="mb-4 w-full rounded"
        />
      )}

      <p><strong>Description:</strong> {post.description}</p>
      <p><strong>Note:</strong> {post.note}</p>
      <p><strong>Media Type:</strong> {post.mediaType}</p>
      <p><strong>Is Template:</strong> {post.isTemplate ? "Yes" : "No"}</p>
    </div>
  );
};

export default SinglePostView;
