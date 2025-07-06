
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BuyerCommentsProps {
  buyerId: string;
}

interface Comment {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
}

const BuyerComments = ({ buyerId }: BuyerCommentsProps) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['buyer-comments', buyerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_comments')
        .select('*')
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (body: string) => {
      const { data, error } = await supabase
        .from('buyer_comments')
        .insert({
          buyer_id: buyerId,
          author_id: user?.id || '',
          body,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-comments', buyerId] });
      setNewComment('');
      toast.success('Comment added successfully');
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('buyer_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-comments', buyerId] });
      toast.success('Comment deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`buyer_comments_${buyerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buyer_comments',
          filter: `buyer_id=eq.${buyerId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['buyer-comments', buyerId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buyerId, queryClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Comments ({comments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-sm text-gray-500">No comments yet. Start the conversation!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {comment.author_id.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {comment.author_id === user?.id ? 'You' : 'Team Member'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </p>
                      {comment.author_id === user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{comment.body}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button
            type="submit"
            disabled={!newComment.trim() || addCommentMutation.isPending}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BuyerComments;
