import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PostTab = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch posts.");
      });
  }, []);

  const handleView = (id) => {
    navigate(`/posts/${id}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">All Posts</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
              <th className="px-4 py-3 border">ID</th>
              <th className="px-4 py-3 border">Description</th>
              <th className="px-4 py-3 border">Media Type</th>
              <th className="px-4 py-3 border">Note</th>
              <th className="px-4 py-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="text-sm border-t">
                <td className="px-4 py-2 border">{post.id}</td>
                <td className="px-4 py-2 border">{post.description}</td>
                <td className="px-4 py-2 border">{post.mediaType}</td>
                <td className="px-4 py-2 border">{post.note}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleView(post.id)}
                    className="text-blue-500 hover:underline mr-2"
                  >
                    View
                  </button>
                  {/* Add Edit/Delete if needed */}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No posts available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostTab;
