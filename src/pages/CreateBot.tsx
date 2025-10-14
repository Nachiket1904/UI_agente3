import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Loader2, FileText, Image as ImageIcon } from 'lucide-react';

const CreateBot = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    system_prompt: '',
  });
  const [logoLeft, setLogoLeft] = useState<File | null>(null);
  const [logoRight, setLogoRight] = useState<File | null>(null);
  const [pdfs, setPdfs] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a bot name');
      return;
    }
    if (!formData.system_prompt.trim()) {
      toast.error('Please enter a system prompt');
      return;
    }

    try {
      setLoading(true);
      await api.createBot({
        name: formData.name,
        system_prompt: formData.system_prompt,
        logo_left: logoLeft || undefined,
        logo_right: logoRight || undefined,
        pdfs: pdfs.length > 0 ? pdfs : undefined,
      });
      
      toast.success('Bot created successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to create bot');
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-card rounded-xl border border-border shadow-lg p-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">Create New Agent</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter Agent name..."
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="prompt">System Prompt</Label>
            <Textarea
              id="prompt"
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              placeholder="Enter the system prompt for your bot..."
              className="mt-2 min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Left Logo</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  {logoLeft ? (
                    <div className="flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 text-primary mb-2" />
                      <span className="text-sm text-foreground">{logoLeft.name}</span>
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
              <Label>Right Logo</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  {logoRight ? (
                    <div className="flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 text-primary mb-2" />
                      <span className="text-sm text-foreground">{logoRight.name}</span>
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
            <Label>Upload PDFs</Label>
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
                  Processing PDFs...
                </>
              ) : (
                'Create Bot'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBot;
