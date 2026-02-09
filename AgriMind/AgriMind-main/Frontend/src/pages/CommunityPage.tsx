import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  ThumbsUp,
  Video,
  PlusCircle,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/* ---------------- DATA ---------------- */

const initialForumPosts = [
  {
    id: "1",
    author: "John Farmer",
    avatar: "https://github.com/shadcn.png",
    title: "Best irrigation techniques for sandy soil?",
    replies: 12,
    likes: 34,
    time: "2 hours ago",
  },
  {
    id: "2",
    author: "Jane Appleseed",
    avatar: "https://github.com/shadcn.png",
    title: "Dealing with pests on my tomato plants - organic solutions?",
    replies: 8,
    likes: 22,
    time: "5 hours ago",
  },
  {
    id: "3",
    author: "Sam Root",
    avatar: "https://github.com/shadcn.png",
    title: "Market prices for corn are up this week in my region.",
    replies: 5,
    likes: 45,
    time: "1 day ago",
  },
];

const experts = [
  {
    name: "Dr. Anya Sharma",
    specialty: "Soil Scientist",
    avatar: "https://github.com/shadcn.png",
  },
  {
    name: "David Lee",
    specialty: "Pest Control Expert",
    avatar: "https://github.com/shadcn.png",
  },
  {
    name: "Maria Garcia",
    specialty: "Agronomist",
    avatar: "https://github.com/shadcn.png",
  },
];

const tutorials = [
  {
    title: "Mastering Drip Irrigation",
    thumbnail:
      "https://imgs.search.brave.com/N1slmMZwB_dQYiMr9vMvBv-LXZhoPeQQs0hjyjEm5UM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE1Lzg3LzQwLzYz/LzM2MF9GXzE1ODc0/MDYzOTlfREt6YzVo/Q2lUM01LRFZCazRP/WElEenVzSkFzTHpF/UEwuanBn",
    link: "https://www.youtube.com/shorts/gYLe20YFhPE",
  },
  {
    title: "Organic Pest Control Basics",
    thumbnail:
      "https://imgs.search.brave.com/ZcNkoKcEjOzrE7wJcsQycHJFgS7u8GISrG6Co24ehOc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9ncm93/aW5naW50aGVnYXJk/ZW4uY29tL3dwLWNv/bnRlbnQvdXBsb2Fk/cy8yMDIyLzA2L09y/Z2FuaWMtUGVzdC1D/b250cm9sLVRoYXQt/UmVhbGx5LVdvcmtz/LTEuanBn",
    link: "https://www.youtube.com/shorts/6GZjKcfgDkg",
  },
  {
    title: "Maximizing Wheat Yield",
    thumbnail:
      "https://imgs.search.brave.com/IYr_zL3G72DLa62qn4VrzSDKdprR6QDfNHQ79fbeM5I/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9ibG9n/Z2VyLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9pbWcvYi9SMjl2/WjJ4bC9BVnZYc0Vo/NzlZR0xLSzB1SnBr/Vzl1WUdUSFMzbWFP/aXFPWjAtV1ZTSHN4/SkxSMUZRMzZrRUFX/LURWU2pGbkphU296/UEpEcVlVanotcE5w/SEJQNHNzTzlENGpG/OWJldzEtb2pURHJS/Xy1Ha1FoSmRNUUNy/dV9LaDE2WUJXV1VX/OG5QekxPYWZuVWhD/WW5HbFBfdkNnRlMw/TEVDdkhLdlBSTUNO/Qi1tZ0x0djYwNjNG/R2ZnLVRGbUVvb0dN/ejVnQ0toN0kvczE2/MDAwL2hvb3JtYW4t/dGVtcC1waWMtd2F0/ZXJtYXJrKDMpLnBu/Zw",
    link: "https://www.youtube.com/shorts/jfvwdu-Kwa0",
  },
];

/* ---------------- COMPONENT ---------------- */

const CommunityPage = () => {
  const [forumPosts, setForumPosts] = useState(initialForumPosts);

  /* ---- BOOK SESSION STATE (UNCHANGED) ---- */
  const [open, setOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<{
    name: string;
    specialty: string;
  } | null>(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  /* ---- ADD FORUM PANEL STATE ---- */
  const [forumPanelOpen, setForumPanelOpen] = useState(false);
  const [forumTitle, setForumTitle] = useState("");
  const [forumDesc, setForumDesc] = useState("");

  const addForum = () => {
    if (!forumTitle.trim()) return;

    setForumPosts([
      {
        id: Date.now().toString(),
        author: "You",
        avatar: "https://github.com/shadcn.png",
        title: forumTitle,
        replies: 0,
        likes: 0,
        time: "Just now",
      },
      ...forumPosts,
    ]);

    setForumTitle("");
    setForumDesc("");
    setForumPanelOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pt-24 relative">
      <div className="container mx-auto px-4 pb-12">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Community Hub</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect, share, and learn with fellow farmers and experts.
          </p>
        </header>

        {/* FORUMS */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Discussion Forums</h2>
            <Button onClick={() => setForumPanelOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Forums
            </Button>
          </div>

          <div className="space-y-6">
            {forumPosts.map((post) => (
              <Link to={`/community/${post.id}`} key={post.id}>
                <Card className="hover:shadow-md">
                  <CardHeader className="flex flex-row gap-4">
                    <Avatar>
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>{post.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{post.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {post.author} • {post.time}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="flex justify-end gap-6">
                    <div className="flex gap-2 items-center">
                      <ThumbsUp className="h-4 w-4" /> {post.likes}
                    </div>
                    <div className="flex gap-2 items-center">
                      <MessageSquare className="h-4 w-4" /> {post.replies}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* EXPERT CONSULTATION – UNCHANGED */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Expert Consultation</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {experts.map((expert) => (
              <Card key={expert.name} className="text-center p-6">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={expert.avatar} />
                  <AvatarFallback>{expert.name[0]}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{expert.name}</h3>
                <p className="text-primary">{expert.specialty}</p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => {
                    setSelectedExpert(expert);
                    setOpen(true);
                  }}
                >
                  Book a Session
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* VIDEOS – UNCHANGED */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Video Tutorials</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {tutorials.map((t) => (
              <a key={t.title} href={t.link} target="_blank" rel="noreferrer">
                <Card className="group overflow-hidden cursor-pointer">
                  <div className="relative">
                    <img
                      src={t.thumbnail}
                      alt={t.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <CardContent>
                    <h3 className="font-semibold">{t.title}</h3>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT SIDE ADD FORUM PANEL */}
      {forumPanelOpen && (
        <div className="fixed top-0 right-0 h-full w-[360px] bg-background border-l shadow-lg z-50 p-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-semibold">Add Forum</h3>
            <Button size="icon" variant="ghost" onClick={() => setForumPanelOpen(false)}>
              <X />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={forumTitle}
                onChange={(e) => setForumTitle(e.target.value)}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={forumDesc}
                onChange={(e) => setForumDesc(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={addForum}>
              Post Forum
            </Button>
          </div>
        </div>
      )}

      {/* BOOK SESSION MODAL – UNCHANGED */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Session</DialogTitle>
          </DialogHeader>

          {selectedExpert && (
            <div className="space-y-4">
              <p className="font-semibold">{selectedExpert.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedExpert.specialty}
              </p>

              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime("");
                  }}
                />
              </div>

              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={time}
                  min={date === today ? nowTime : undefined}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                alert("Session booked successfully!");
                setOpen(false);
                setDate("");
                setTime("");
                setMessage("");
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityPage;
