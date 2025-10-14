import { Bot } from '@/services/api';
import { Button } from '@/components/ui/button';
import { MessageSquare, Pencil, Trash2, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BotCardProps {
  bot: Bot;
  onDelete: (botId: string) => void;
}

const BotCard = ({ bot, onDelete }: BotCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl border border-border shadow-md hover:shadow-lg transition-all duration-200 p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex gap-3">
          {bot.logo_left ? (
            <img 
              src={bot.logo_left} 
              alt="Left logo" 
              className="w-12 h-12 object-contain rounded-lg border border-border"
            />
          ) : (
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          {bot.logo_right ? (
            <img 
              src={bot.logo_right} 
              alt="Right logo" 
              className="w-12 h-12 object-contain rounded-lg border border-border"
            />
          ) : (
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">{bot.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {bot.system_prompt}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={() => navigate(`/chat/${bot.id}`)}
          className="flex-1"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate(`/edit/${bot.id}`)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline"
          onClick={() => onDelete(bot.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default BotCard;
