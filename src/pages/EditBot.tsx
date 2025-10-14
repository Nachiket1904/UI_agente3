import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, Bot } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Upload, Loader2, FileText, ImageIcon, ArrowLeft } from 'lucide-react';

const EditBot = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [bot, setBot] = useState<Bot | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [logoLeft, setLogoLeft] = useState<File | null>(null);
  const [logoRight, setLogoRight] = useState<File | null>(null);
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [rebuildVectorstore, setRebuildVectorstore] = useState(false);

  useEffect(() => {
    if (botId) {
      loadBot();
    }
  }, [botId]);

  const loadBot = async () => {
    if (!botId) return;
    
    try {
      setInitialLoading(true);
      const data = await api.getBot(botId);
      setBot(data);
      setSystemPrompt(data.system_prompt);
    } catch (error) {
      toast.error('Failed to load bot');
      console.error(error);
      navigate('/');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botId) return;

    try {
      setLoading(true);
      await api.updateBot(botId, {
        system_prompt: systemPrompt,
        logo_left: logoLeft || undefined,
        logo_right: logoRight || undefined,
        pdfs: pdfs.length > 0 ? pdfs : undefined,
        rebuild_vectorstore: rebuildVectorstore,
      });
      
      toast.success('Bot updated successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to update bot');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (position: 'left' | 'right') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (position === 'left') {
        setLogoLeft(file);
      } else {
        setLogoRight(file);
      }
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPdfs(prev => [...prev, ...files]);
  };

  const removePdf = (index: number) => {
    setPdfs(prev => prev.filter((_, i) => i !== index));
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bot) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>

      <div className="bg-card rounded-xl border border-border shadow-lg p-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Edit Agent</h2>
        <p className="text-muted-foreground mb-6">{bot.name}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="prompt">System Prompt</Label>
            <Textarea
              id="prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter the system prompt for your bot..."
              className="mt-2 min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Replace Left Logo</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  {logoLeft ? (
                    <div className="flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 text-primary mb-2" />
                      <span className="text-sm text-foreground">{logoLeft.name}</span>
                    </div>
                  ) : bot.logo_left ? (
                    <div className="flex flex-col items-center">
                      <img src={bot.logo_left} alt="Current left logo" className="w-16 h-16 object-contain mb-2" />
                      <span className="text-xs text-muted-foreground">Click to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload left logo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange('left')}
                  />
                </label>
              </div>
            </div>

            <div>
              <Label>Replace Right Logo</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  {logoRight ? (
                    <div className="flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 text-primary mb-2" />
                      <span className="text-sm text-foreground">{logoRight.name}</span>
                    </div>
                  ) : bot.logo_right ? (
                    <div className="flex flex-col items-center">
                      <img src={bot.logo_right} alt="Current right logo" className="w-16 h-16 object-contain mb-2" />
                      <span className="text-xs text-muted-foreground">Click to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload right logo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange('right')}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <Label>Add New PDFs</Label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload PDF files</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  multiple
                  onChange={handlePdfChange}
                />
              </label>
            </div>
            
            {pdfs.length > 0 && (
              <div className="mt-4 space-y-2">
                {pdfs.map((pdf, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{pdf.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePdf(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            <Checkbox
              id="rebuild"
              checked={rebuildVectorstore}
              onCheckedChange={(checked) => setRebuildVectorstore(checked as boolean)}
            />
            <Label htmlFor="rebuild" className="cursor-pointer">
              Rebuild vectorstore (process all PDFs again)
            </Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBot;
