import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Static data for all forum posts and comments.
// In a real app, you would fetch this from a backend based on the postId.
const allPostsData = {
  '1': {
    id: '1',
    author: "John Farmer",
    avatar: "https://github.com/shadcn.png",
    title: "Best irrigation techniques for sandy soil?",
    content: "I've been struggling to maintain moisture in my sandy soil fields. Drip irrigation seems expensive to set up. Are there any other cost-effective techniques that have worked well for others? Any advice on improving water retention would be greatly appreciated.",
    replies: 2,
    likes: 34,
    time: "2 hours ago",
    comments: [
      { author: "Jane Appleseed", avatar: "https://github.com/shadcn.png", text: "Have you tried adding organic matter like compost? It really helps improve water retention in sandy soils. It made a huge difference for my farm.", time: "1 hour ago" },
      { author: "Sam Root", avatar: "https://github.com/shadcn.png", text: "I agree with Jane. Mulching is also a game-changer. A thick layer of straw or wood chips on the surface can significantly reduce evaporation.", time: "45 minutes ago" },
    ],
  },
  '2': {
    id: '2',
    author: "Jane Appleseed",
    avatar: "https://github.com/shadcn.png",
    title: "Dealing with pests on my tomato plants - organic solutions?",
    content: "I've noticed some aphids and whiteflies on my tomato plants. I want to avoid chemical pesticides. What are some effective organic or natural methods to control them? I've heard about neem oil but I'm not sure how to use it properly.",
    replies: 1,
    likes: 22,
    time: "5 hours ago",
    comments: [
        { author: "Dr. Anya Sharma", avatar: "https://github.com/shadcn.png", text: "Neem oil is a great choice. Mix 1-2 teaspoons of neem oil with a teaspoon of mild soap in a liter of water. Spray it on the plants, especially the undersides of leaves, every 7-10 days. Also, introducing ladybugs can be a very effective biological control for aphids!", time: "3 hours ago"},
    ],
  },
    '3': {
    id: '3',
    author: "Sam Root",
    avatar: "https://github.com/shadcn.png",
    title: "Market prices for corn are up this week in my region.",
    content: "Just a heads up for fellow corn growers in the Midwest. Prices have jumped about 15% this week due to increased demand. Might be a good time to sell if you have stock. Anyone else seeing this trend?",
    replies: 0,
    likes: 45,
    time: "1 day ago",
    comments: [],
  },
};

const ForumPostPage = () => {
  const { postId } = useParams<{ postId: keyof typeof allPostsData }>();
  const post = postId ? allPostsData[postId] : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-background pt-24 text-center">
        <h1 className="text-2xl font-bold">Post not found.</h1>
        <p className="text-muted-foreground">The discussion you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto max-w-3xl px-4 pb-12">
        {/* Main Post Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{post.title}</CardTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2">
              <Avatar className="h-8 w-8"><AvatarImage src={post.avatar} /><AvatarFallback>{post.author.charAt(0)}</AvatarFallback></Avatar>
              <span>Posted by {post.author} • {post.time}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 leading-relaxed">{post.content}</p>
          </CardContent>
          <CardFooter className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-muted-foreground"><ThumbsUp className="h-4 w-4" /><span>{post.likes} Likes</span></div>
            <div className="flex items-center gap-2 text-muted-foreground"><MessageSquare className="h-4 w-4" /><span>{post.replies} Replies</span></div>
          </CardFooter>
        </Card>

        {/* Add a Reply Section */}
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Leave a Reply</h3>
            <Textarea placeholder="Write your comment here..." className="mb-2" />
            <Button>Post Reply</Button>
        </div>
        
        {/* Comments Section */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4 border-t border-border pt-6">Comments</h3>
          <div className="space-y-6">
            {post.comments.map((comment, index) => (
              <div key={index} className="flex gap-4">
                <Avatar><AvatarImage src={comment.avatar} /><AvatarFallback>{comment.author.charAt(0)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="text-foreground/90">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
            {post.comments.length === 0 && (
                <p className="text-muted-foreground">No comments yet. Be the first to reply!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPostPage;

