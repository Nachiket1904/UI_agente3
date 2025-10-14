import { useState, useEffect } from 'react';
import { api, Bot } from '@/services/api';
import BotCard from '@/components/BotCard';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [botToDelete, setBotToDelete] = useState<Bot | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      setLoading(true);
      const data = await api.getBots();
      setBots(data);
    } catch (error) {
      toast.error('Failed to load bots');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    if (bot) {
      setBotToDelete(bot);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!botToDelete) return;

    try {
      await api.deleteBot(botToDelete.id);
      toast.success('Bot deleted successfully');
      setBots(bots.filter(b => b.id !== botToDelete.id));
      setDeleteDialogOpen(false);
      setBotToDelete(null);
    } catch (error) {
      toast.error('Failed to delete bot');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="bg-muted rounded-full p-8 mb-6">
          <Plus className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">No bots yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Get started by creating your first RAG bot. Upload documents and create an AI assistant
          that can answer questions based on your content.
        </p>
        <Button onClick={() => navigate('/create')} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Bot
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <BotCard key={bot.id} bot={bot} onDelete={handleDeleteClick} />
        ))}
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        botName={botToDelete?.name}
      />
    </>
  );
};

export default Home;
