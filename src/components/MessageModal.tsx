import React from 'react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/Icons';
import { openWhatsApp, formatPhoneNumber } from '@/lib/whatsapp';
import { toast } from '@/hooks/use-toast';

export function MessageModal() {
  const { messageModal, closeMessageModal } = useApp();
  const [phone, setPhone] = React.useState('');
  const [text, setText] = React.useState('');
  
  React.useEffect(() => {
    if (messageModal.open) {
      setPhone(messageModal.phone);
      setText(messageModal.text);
    }
  }, [messageModal]);
  
  const handleSend = () => {
    let targetPhone = phone;
    
    if (!targetPhone || formatPhoneNumber(targetPhone).length < 10) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit mobile number.',
        variant: 'destructive'
      });
      return;
    }
    
    const success = openWhatsApp(targetPhone, text);
    
    if (success) {
      toast({
        title: 'WhatsApp Opened',
        description: 'Message is ready to send in WhatsApp.',
      });
      closeMessageModal();
    } else {
      toast({
        title: 'Failed to Open WhatsApp',
        description: 'Please check the phone number and try again.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Dialog open={messageModal.open} onOpenChange={(open) => !open && closeMessageModal()}>
      <DialogContent className="sm:max-w-[500px] glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-success/10">
              <Icons.MessageCircle className="w-5 h-5 text-success" />
            </div>
            Send WhatsApp Message
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp Number</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={closeMessageModal}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              onClick={handleSend}
            >
              <Icons.Send className="w-4 h-4 mr-2" />
              Send via WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
