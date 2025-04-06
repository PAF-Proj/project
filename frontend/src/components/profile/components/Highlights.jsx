import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultAvatar from '../../../assets/avatar.png';
import { API_BASE_URL } from '../../../config/apiConfig';

const Highlights = ({ posts, formatPostDate }) => {
  const navigate = useNavigate();
  const [originalPosts, setOriginalPosts] = useState({});

  // Memoize top 3 posts based on likes
  const topPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
      .slice(0, 3);
  }, [posts]);

  // Fetch original posts for shared posts
  useEffect(() => {
    const fetchOriginalPosts = async () => {
      const token = localStorage.getItem('token');
      const sharedPosts = topPosts.filter(post => post.originalPostId);
      
      if (sharedPosts.length === 0) return;
      
      const uniqueOriginalPostIds = [...new Set(sharedPosts.map(post => post.originalPostId))];
      const fetchedPosts = {};
      
      for (const postId of uniqueOriginalPostIds) {
        try {
          const response = await fetch(`${API_BASE_URL}/posts/detail/${postId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            fetchedPosts[postId] = data;
          }
        } catch (error) {
          console.error('Error fetching original post:', error);
        }
      }
      
      setOriginalPosts(fetchedPosts);
    };
    
    if (topPosts.length > 0) {
      fetchOriginalPosts();
    }
  }, [topPosts]);

  const navigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const renderPostContent = (post) => (
    <div className="px-3 pb-3">
      <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
      {post.mediaUrl && (
        <div className="mt-3 rounded-lg overflow-hidden">
          {post.mediaType === 'IMAGE' ? (
            <img
              src={post.mediaUrl}
              alt="Post media"
              className="w-full h-auto"
            />
          ) : (
            <video
              src={post.mediaUrl}
              controls
              className="w-full h-auto"
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 px-4">Top Highlights</h2>
      
      {topPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
          {topPosts.map(post => (
            <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-3">
                <img
                  src={post.authorProfilePicture || DefaultAvatar}
                  alt={post.authorUsername}
                  className="h-10 w-10 rounded-full object-cover cursor-pointer"
                  onClick={() => navigateToProfile(post.authorId)}
                />
                <div className="ml-3">
                  <p 
                    className="font-medium text-gray-800 cursor-pointer hover:underline"
                    onClick={() => navigateToProfile(post.authorId)}
                  >
                    {post.authorFirstName && post.authorLastName
                      ? `${post.authorFirstName} ${post.authorLastName}`
                      : post.authorFirstName || post.authorLastName || post.authorUsername}
                  </p>
                  <p className="text-xs text-gray-500">{formatPostDate(post.createdAt)}</p>
                </div>
              </div>

              {post.originalPostId ? (
                <div className="mb-3">
                  {post.shareMessage && (
                    <p className="text-gray-800 whitespace-pre-line mb-2">{post.shareMessage}</p>
                  )}
                  <div className="border border-gray-200 rounded-lg bg-gray-50">
                    {originalPosts[post.originalPostId] ? (
                      <>
                        <div className="p-3">
                          <p className="text-sm text-gray-500">Original post by {
                            originalPosts[post.originalPostId].authorFirstName || 
                            originalPosts[post.originalPostId].authorUsername
                          }</p>
                        </div>
                        {renderPostContent(originalPosts[post.originalPostId])}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p>Original post is no longer available</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : renderPostContent(post)}

              <div className="pt-3 border-t border-gray-200 flex items-center text-gray-500">
                <i className="bx bx-like mr-1"></i>
                <span>{post.likes?.length || 0} Likes</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-100 shadow-sm mx-4">
          <i className='bx bx-star text-3xl text-gray-400 mb-2'></i>
          <p className="text-gray-600">No highlights available yet</p>
        </div>
      )}
    </div>
  );
};

export default Highlights;