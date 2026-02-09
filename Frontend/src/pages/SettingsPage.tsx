import { useState } from "react";
import { Button } from "@/components/ui/button";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import ProfileSettings from "../components/settings/ProfileSettings";
import { motion, AnimatePresence } from "framer-motion";

const SettingsPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // assume user is logged in
  const [authMode, setAuthMode] = useState<"none" | "login" | "register">("none");
  const [showAuth, setShowAuth] = useState(false); // only show after logout

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthMode("none");
    setShowAuth(true); // show login/register options
  };

  const handleBack = () => {
    setAuthMode("none");
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowAuth(false); // hide login/register once logged in
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    setShowAuth(false); // hide login/register once registered
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto max-w-4xl px-4">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your account and application preferences.
          </p>
        </header>

        <div className="space-y-12">
          {/* Profile Settings */}
          <ProfileSettings />

          {/* Appearance Settings */}
          <AppearanceSettings />

          {/* Account / Auth Section */}
          {!showAuth && isLoggedIn && (
            <div className="bg-card border border-primary/50 rounded-lg p-6 text-center shadow-md">
              <h3 className="text-lg font-semibold text-primary mb-2">Account</h3>
              <p className="text-muted-foreground mb-4">
                You are currently logged in. Manage your session below.
              </p>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}

          {showAuth && (
            <div className="bg-card border border-primary/50 rounded-lg p-6 text-center shadow-md">
              <h3 className="text-lg font-semibold text-primary mb-2">
                Authentication
              </h3>
              <p className="text-muted-foreground mb-4">
                Access your account or create a new one.
              </p>

              {authMode === "none" && (
                <div className="flex justify-center gap-4">
                  <Button variant="default" onClick={() => setAuthMode("login")}>
                    Login
                  </Button>
                  <Button variant="secondary" onClick={() => setAuthMode("register")}>
                    Register
                  </Button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {authMode === "login" && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                  >
                    <h4 className="text-xl font-semibold mb-4">Login</h4>
                    <form
                      className="space-y-4 max-w-sm mx-auto text-left"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                      }}
                    >
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                      />
                      <Button type="submit" className="w-full">
                        Login
                      </Button>
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        Don’t have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthMode("register")}
                          className="text-primary hover:underline"
                        >
                          Register
                        </button>
                      </p>
                    </form>
                  </motion.div>
                )}

                {authMode === "register" && (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                  >
                    <h4 className="text-xl font-semibold mb-4">Register</h4>
                    <form
                      className="space-y-4 max-w-sm mx-auto text-left"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleRegister();
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                      />
                      <Button type="submit" className="w-full">
                        Register
                      </Button>
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthMode("login")}
                          className="text-primary hover:underline"
                        >
                          Login
                        </button>
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Back button */}
              {authMode !== "none" && (
                <div className="mt-6">
                  <Button variant="outline" onClick={handleBack} className="text-sm">
                    Back
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
