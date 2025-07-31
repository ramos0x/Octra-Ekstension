import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Globe, AlertTriangle, Eye, Send, ExternalLink } from 'lucide-react';
import { WalletManager } from '../utils/walletManager';
import { Wallet } from '../types/wallet';

interface UnlockWalletProps {
  onUnlock: (wallets: Wallet[]) => void;
}

export function UnlockWallet({ onUnlock }: UnlockWalletProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<any>(null);

  // Check for pending dApp requests in URL parameters
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'unlock') {
      const pendingConnection = urlParams.get('pendingConnection');
      const pendingTransaction = urlParams.get('pendingTransaction');
      const pendingContract = urlParams.get('pendingContract');
      const origin = urlParams.get('origin');
      const appName = urlParams.get('appName');
      
      if (pendingConnection && origin) {
        setPendingRequest({
          type: 'connection',
          origin: decodeURIComponent(origin),
          appName: appName ? decodeURIComponent(appName) : origin
        });
      } else if (pendingTransaction && origin) {
        setPendingRequest({
          type: 'transaction',
          origin: decodeURIComponent(origin),
          appName: appName ? decodeURIComponent(appName) : origin
        });
      } else if (pendingContract && origin) {
        setPendingRequest({
          type: 'contract',
          origin: decodeURIComponent(origin),
          appName: appName ? decodeURIComponent(appName) : origin
        });
      }
    }
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔓 UnlockWallet: Attempting to unlock...');
      const wallets = await WalletManager.unlockWallets(password);
      console.log('✅ UnlockWallet: Unlock successful, wallets:', wallets.length);
      
      // Simple callback - NO state management here
      onUnlock(wallets);
      
      // If there's a pending dApp request, redirect to handle it
      if (pendingRequest) {
        // Small delay to ensure wallet state is updated
        setTimeout(() => {
          if (pendingRequest.type === 'connection') {
            // Redirect to connection approval
            window.location.href = chrome.runtime.getURL('index.html?action=connect');
          } else if (pendingRequest.type === 'transaction') {
            // Redirect to transaction approval
            window.location.href = chrome.runtime.getURL('index.html?action=transaction');
          } else if (pendingRequest.type === 'contract') {
            // Redirect to contract approval
            window.location.href = chrome.runtime.getURL('index.html?action=contract');
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('❌ UnlockWallet: Unlock failed:', error);
      setError(error.message === 'Invalid password' ? 'Invalid password' : 'Failed to unlock wallet');
    } finally {
      setIsLoading(false);
      setPassword(''); // Clear password for security
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6 space-y-6">
        {/* dApp Request Context */}
        {pendingRequest && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {pendingRequest.appName?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-lg">
                {pendingRequest.appName} wants to connect
              </CardTitle>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                {pendingRequest.origin}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  {pendingRequest.type === 'connection' && 'This app wants to connect to your wallet. '}
                  {pendingRequest.type === 'transaction' && 'This app wants to send a transaction. '}
                  {pendingRequest.type === 'contract' && 'This app wants to interact with a smart contract. '}
                  Please unlock your wallet to continue.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary rounded-full">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">
              {pendingRequest ? 'Unlock Required' : 'Unlock Wallet'}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {pendingRequest 
                ? 'Enter your password to unlock wallet and continue with the dApp request'
                : 'Enter your password to access your wallets'
              }
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your wallet password"
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Unlocking...' : 'Unlock Wallet'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {pendingRequest && (
          <div className="text-center text-sm text-muted-foreground">
            <p>After unlocking, you'll be redirected to approve the dApp request</p>
          </div>
        )}
      </div>
    </div>
  );
}