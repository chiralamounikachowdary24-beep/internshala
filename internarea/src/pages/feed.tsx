import React, { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { Heart, Image as ImageIcon, MessageCircle, Send, Share2, Video, X, Trash2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://backend-fawn-xi-33.vercel.app";

type Comment = {
  userEmail: string;
  userName?: string;
  text: string;
  createdAt: string;
};

type Post = {
  _id: string;
  userEmail: string;
  userName?: string;
  media?: string;
  type?: "image" | "video";
  caption?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
};

type Allowance = {
  friendCount: number;
  limit: number | null;
  usedToday: number;
  remaining: number | null;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function Feed() {
  const user = useSelector(selectuser);

  const [posts, setPosts] = useState<Post[]>([]);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [fileName, setFileName] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [message, setMessage] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const userName = useMemo(() => user?.name || user?.email?.split("@")[0] || "User", [user]);

  const fetchPosts = async () => {
    const res = await axios.get<Post[]>(`${API}/api/post`);
    setPosts(res.data);
  };

  const fetchAllowance = useCallback(async () => {
    if (!user?.email) {
      setAllowance(null);
      return;
    }

    const res = await axios.get<Allowance>(`${API}/api/post/allowance`, {
      params: { userEmail: user.email },
    });
    setAllowance(res.data);
  }, [user?.email]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  const onMediaChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setMessage("Please choose a picture or video file.");
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setMedia(dataUrl);
    setMediaType(file.type.startsWith("video/") ? "video" : "image");
    setFileName(file.name);
    setMessage("");
  };

  const clearMedia = () => {
    setMedia("");
    setFileName("");
    setMediaType("image");
  };

  const createPost = async () => {
    if (!user?.email) {
      setMessage("Login first to post.");
      return;
    }

    if (!caption.trim() && !media) {
      setMessage("Add a caption, picture, or video before posting.");
      return;
    }

    try {
      setIsPosting(true);
      setMessage("");

      const res = await axios.post<{ allowance: Allowance }>(`${API}/api/post/create`, {
        userEmail: user.email,
        userName,
        caption,
        media,
        type: media ? mediaType : undefined,
      });

      setCaption("");
      clearMedia();
      setAllowance(res.data.allowance);
      await fetchPosts();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; allowance?: Allowance }>;
      setMessage(axiosError.response?.data?.message || "Unable to create post.");
      if (axiosError.response?.data?.allowance) setAllowance(axiosError.response.data.allowance);
    } finally {
      setIsPosting(false);
    }
  };

  const likePost = async (id: string) => {
    if (!user?.email) {
      setMessage("Login first to like posts.");
      return;
    }

    await axios.post(`${API}/api/post/like/${id}`, { email: user.email });
    await fetchPosts();
  };

  const deletePost = async (id: string) => {
    if (!user?.email) return;
    
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`${API}/api/post/${id}`, { data: { userEmail: user.email } });
      await fetchPosts();
      fetchAllowance();
    } catch (error) {
      setMessage("Unable to delete post.");
    }
  };

  const commentPost = async (id: string) => {
    if (!user?.email) {
      setMessage("Login first to comment.");
      return;
    }

    const text = commentDrafts[id]?.trim();
    if (!text) return;

    await axios.post(`${API}/api/post/comment/${id}`, {
      userEmail: user.email,
      userName,
      text,
    });

    setCommentDrafts((drafts) => ({ ...drafts, [id]: "" }));
    await fetchPosts();
  };

  const onCommentKeyDown = (event: KeyboardEvent<HTMLInputElement>, postId: string) => {
    if (event.key === "Enter") {
      commentPost(postId);
    }
  };

  const sharePost = async (post: Post) => {
    const shareUrl = `${window.location.origin}/feed#${post._id}`;

    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl });
        return;
      } catch (error) {
        // Fallback to clipboard if user cancels or share fails
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage("Post link copied to clipboard.");
    } catch (error) {
      setMessage("Unable to copy link.");
    }
  };

  const allowanceText = allowance
    ? allowance.limit === null
      ? `More than 10 friends: unlimited posts today. You already posted ${allowance.usedToday}.`
      : `${allowance.remaining} of ${allowance.limit} posts left today. Friends: ${allowance.friendCount}.`
    : "Login to see your daily posting limit.";

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-8 text-slate-950">
      <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-semibold text-emerald-700">Community feed</p>
            <h1 className="mt-1 text-2xl font-bold">Share your update</h1>
            <p className="mt-2 text-sm text-slate-600">{allowanceText}</p>
          </div>

          <textarea
            className="min-h-28 w-full resize-none rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-600"
            placeholder="Write something for your friends..."
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />

          {media && (
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {mediaType === "video" ? (
                <video className="max-h-72 w-full bg-black object-contain" src={media} controls />
              ) : (
                <img className="max-h-72 w-full object-cover" src={media} alt="Selected post media preview" />
              )}
              <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-slate-600">
                <span className="truncate">{fileName}</span>
                <button className="rounded p-1 hover:bg-slate-200" onClick={clearMedia} aria-label="Remove media">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:border-emerald-600">
              <ImageIcon size={17} />
              <Video size={17} />
              Upload
              <input className="hidden" type="file" accept="image/*,video/*" onChange={onMediaChange} />
            </label>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              onClick={createPost}
              disabled={isPosting}
            >
              <Send size={17} />
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>

          {message && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
        </aside>

        <section className="space-y-5">
          {posts.map((post) => {
            const liked = Boolean(user?.email && post.likes.includes(user.email));

            return (
              <article id={post._id} key={post._id} className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 p-5">
                  <div>
                    <h2 className="font-semibold">{post.userName || post.userEmail}</h2>
                    <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {post.userEmail === user?.email && (
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:border-red-600 hover:bg-red-50"
                        onClick={() => deletePost(post._id)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}
                    <button
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:border-emerald-600"
                      onClick={() => sharePost(post)}
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>

                {post.caption && <p className="px-5 pb-4 text-sm leading-6 text-slate-800">{post.caption}</p>}

                {post.media && post.type === "video" && (
                  <video className="max-h-[560px] w-full bg-black object-contain" src={post.media} controls />
                )}

                {post.media && post.type !== "video" && (
                  <img className="max-h-[560px] w-full object-cover" src={post.media} alt={post.caption || "Feed post"} />
                )}

                <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-3">
                  <button
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                      liked ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"
                    }`}
                    onClick={() => likePost(post._id)}
                  >
                    <Heart size={17} fill={liked ? "currentColor" : "none"} />
                    {post.likes.length}
                  </button>
                  <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <MessageCircle size={17} />
                    {post.comments.length} comments
                  </span>
                </div>

                <div className="space-y-3 border-t border-slate-100 px-5 py-4">
                  {post.comments.map((comment, index) => (
                    <div key={`${comment.createdAt}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <p className="font-semibold">{comment.userName || comment.userEmail}</p>
                      <p className="text-slate-700">{comment.text}</p>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
                      placeholder="Write a comment"
                      value={commentDrafts[post._id] || ""}
                      onChange={(event) =>
                        setCommentDrafts((drafts) => ({ ...drafts, [post._id]: event.target.value }))
                      }
                      onKeyDown={(event) => onCommentKeyDown(event, post._id)}
                    />
                    <button
                      className="rounded-lg bg-slate-900 px-3 py-2 text-white"
                      onClick={() => commentPost(post._id)}
                      aria-label="Send comment"
                    >
                      <Send size={17} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {posts.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No posts yet. Be the first to share a picture, video, or update.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
