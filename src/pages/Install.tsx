import { motion } from 'framer-motion';
import { Download, Smartphone, Bell, Wifi, Share, MoreVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';
import PageLayout from '@/components/layout/PageLayout';

const Install = () => {
  const { isInstalled, isIOS, isAndroid, promptInstall, canPrompt } = usePWAInstall();
  const { isSupported, permission, requestPermission } = usePushNotifications();

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      toast.success("Installation réussie !", {
        description: "L'application FINOM a été ajoutée à votre écran d'accueil.",
      });
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Notifications activées", {
        description: "Vous recevrez des alertes pour vos demandes de prêt.",
      });
    } else {
      toast.error("Notifications refusées", {
        description: "Vous pouvez les activer dans les paramètres de votre navigateur.",
      });
    }
  };

  const features = [
    {
      icon: Smartphone,
      title: "Accès rapide",
      description: "Lancez l'app directement depuis votre écran d'accueil"
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Recevez des alertes en temps réel sur vos demandes"
    },
    {
      icon: Wifi,
      title: "Mode hors-ligne",
      description: "Consultez vos informations même sans connexion"
    }
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-pink-50/20 py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl font-black text-white">F</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Installer FINOM</h1>
            <p className="text-muted-foreground">
              Ajoutez l'application à votre écran d'accueil pour un accès rapide
            </p>
          </motion.div>

          {isInstalled ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-green-800 mb-2">
                    Application installée !
                  </h2>
                  <p className="text-green-700">
                    FINOM est déjà installée sur votre appareil.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* Features */}
              <div className="grid gap-4 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="flex items-center gap-4 py-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Install Button or Instructions */}
              {canPrompt ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    onClick={handleInstall} 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-primary to-pink-600 hover:opacity-90"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Installer l'application
                  </Button>
                </motion.div>
              ) : (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Instructions d'installation</CardTitle>
                    <CardDescription>
                      {isIOS ? "Sur iPhone/iPad (Safari)" : isAndroid ? "Sur Android (Chrome)" : "Sur votre navigateur"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isIOS ? (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">1</span>
                          </div>
                          <div>
                            <p className="font-medium">Appuyez sur le bouton Partager</p>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                              <Share className="w-4 h-4" />
                              <span className="text-sm">en bas de l'écran</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">2</span>
                          </div>
                          <div>
                            <p className="font-medium">Sélectionnez "Sur l'écran d'accueil"</p>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                              <Plus className="w-4 h-4" />
                              <span className="text-sm">dans le menu qui apparaît</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">3</span>
                          </div>
                          <p className="font-medium">Appuyez sur "Ajouter"</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">1</span>
                          </div>
                          <div>
                            <p className="font-medium">Appuyez sur le menu</p>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                              <MoreVertical className="w-4 h-4" />
                              <span className="text-sm">les 3 points en haut à droite</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">2</span>
                          </div>
                          <div>
                            <p className="font-medium">Sélectionnez "Installer l'application"</p>
                            <span className="text-sm text-muted-foreground">ou "Ajouter à l'écran d'accueil"</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">3</span>
                          </div>
                          <p className="font-medium">Confirmez l'installation</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Notifications Section */}
          {isSupported && permission !== 'granted' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Activer les notifications
                  </CardTitle>
                  <CardDescription>
                    Recevez des alertes instantanées pour vos demandes de prêt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleEnableNotifications}
                    variant="outline"
                    className="w-full"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Activer les notifications
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {permission === 'granted' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-sm text-green-600 flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Notifications activées
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Install;
