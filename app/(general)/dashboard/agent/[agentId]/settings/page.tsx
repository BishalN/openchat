"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

import { useAgentSettings } from "@/hooks/use-settings-mutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types
import type { ReactNode } from "react";

// Constants
const TABS = {
  GENERAL: "general",
  CHAT_INTERFACE: "chat-interface",
} as const;

export type TabType = (typeof TABS)[keyof typeof TABS];

// Icons
import {
  GeneralIcon,
  ChatInterfaceIcon,
} from "./icons";

// Components
interface TabButtonProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const TabButton = ({ icon, label, active, onClick }: TabButtonProps) => {
  return (
    <button
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full text-left ${active
        ? "bg-primary/10 text-primary"
        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        }`}
      onClick={onClick}
      aria-selected={active}
      role="tab"
    >
      <div className={active ? "text-primary" : "text-muted-foreground"}>
        {icon}
      </div>
      {label}
    </button>
  );
};

interface TabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const SettingsTabs = ({ activeTab, setActiveTab }: TabsProps) => {
  return (
    <div className="space-y-1" role="tablist">
      <TabButton
        icon={<GeneralIcon />}
        label="General"
        active={activeTab === TABS.GENERAL}
        onClick={() => setActiveTab(TABS.GENERAL)}
      />
      <TabButton
        icon={<ChatInterfaceIcon />}
        label="Chat Interface"
        active={activeTab === TABS.CHAT_INTERFACE}
        onClick={() => setActiveTab(TABS.CHAT_INTERFACE)}
      />
    </div>
  );
};

interface GeneralSettingsProps {
  agent: any;
  settings: any;
  isLoading: boolean;
  isUpdating: boolean;
  setName: (name: string) => void;
  saveSettings: () => Promise<void>;
}

const GeneralSettings = ({
  agent,
  settings,
  isLoading,
  isUpdating,
  setName,
  saveSettings,
}: GeneralSettingsProps) => {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">General</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="agentId" className="text-sm font-medium">
            Agent ID
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="agentId"
              value={agent?.id ?? ""}
              readOnly
              className="font-mono text-sm"
            />
            {/* <Button variant="outline" size="icon" aria-label="Copy agent ID">
              <Copy className="h-4 w-4" />
            </Button> */}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="agentName" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="agentName"
            value={settings.name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button disabled={isLoading || isUpdating} onClick={saveSettings}>
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface DangerZoneProps {
  agent: any;
  openDeleteDialog: () => void;
  openDeleteConversationsDialog: () => void;
}

const DangerZone = ({
  agent,
  openDeleteDialog,
  openDeleteConversationsDialog,
}: DangerZoneProps) => {
  return (
    <>
      <Separator className="my-8">
        <span className="text-xs mt-4 font-medium text-red-500 px-2">
          DANGER ZONE
        </span>
      </Separator>

      {/* Delete conversations section */}
      <section
        className="border border-red-200 dark:border-red-900 rounded-lg p-6"
        aria-labelledby="delete-conversations-heading"
      >
        <h3
          id="delete-conversations-heading"
          className="text-xl font-semibold text-red-500 mb-4"
        >
          Delete all conversations
        </h3>

        <p className="text-muted-foreground mb-4">
          Once you delete all your conversations, there is no going back. Please
          be certain.
          <br />
          All the conversations on this agent will be deleted.{" "}
          <span className="font-semibold">This action is not reversible</span>
        </p>

        <div className="flex justify-end">
          <Button variant="destructive" onClick={openDeleteConversationsDialog}>
            Delete All Conversations
          </Button>
        </div>
      </section>

      {/* Delete agent section */}
      <section
        className="border border-red-200 dark:border-red-900 rounded-lg p-6 mt-6"
        aria-labelledby="delete-agent-heading"
      >
        <h3
          id="delete-agent-heading"
          className="text-xl font-semibold text-red-500 mb-4"
        >
          Delete agent
        </h3>

        <p className="text-muted-foreground mb-4">
          Once you delete your agent, there is no going back. Please be certain.
          <br />
          All your uploaded data will be deleted.{" "}
          <span className="font-semibold">This action is not reversible</span>
        </p>

        <div className="flex justify-end">
          <Button variant="destructive" onClick={openDeleteDialog}>
            Delete Agent
          </Button>
        </div>
      </section>
    </>
  );
};

interface DeleteAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agent: any;
  confirmationText: string;
  setConfirmationText: (text: string) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const DeleteAgentDialog = ({
  isOpen,
  onClose,
  agent,
  confirmationText,
  setConfirmationText,
  onDelete,
  isDeleting,
}: DeleteAgentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-500">Delete Agent</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            agent and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4">
            To confirm, please type <strong>{agent?.name}</strong> below:
          </p>
          <Input
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={`Type "${agent?.name}" to confirm`}
            className="mb-2"
          />

          <div className="text-xs text-muted-foreground">
            This action is not reversible. All data will be permanently deleted.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={confirmationText !== agent?.name || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteConversationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agent: any;
  onDelete: () => void;
  isDeleting: boolean;
}

const DeleteConversationsDialog = ({
  isOpen,
  onClose,
  agent,
  onDelete,
  isDeleting,
}: DeleteConversationsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-500">
            Delete All Conversations
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete all
            conversations for this agent.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="text-sm mb-4">
            Are you sure you want to delete all conversations for{" "}
            <strong>{agent?.name}</strong>?
          </div>

          <div className="text-xs text-muted-foreground">
            This action is not reversible. All conversation data will be
            permanently deleted.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete All Conversations"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { ChatInterfaceSettings } from "./chat-interface";

// Main component
export default function SettingsPage() {
  const { agentId } = useParams();
  const {
    activeTab = TABS.GENERAL,
    setActiveTab,
    agent,
    settings,
    isLoading,
    isUpdating,
    setName,
    saveSettings,
    handleDeleteAgent,
    isDeleteDialogOpen,
    deleteConfirmationText,
    setDeleteConfirmationText,
    openDeleteDialog,
    closeDeleteDialog,
    isDeleting,
    openDeleteConversationsDialog,
    closeDeleteConversationsDialog,
    isDeleteConversationsDialogOpen,
    handleDeleteAllConversations,
    isDeletingConversations,
  } = useAgentSettings(agentId as string);

  // Get current tab content based on activeTab
  const currentTabContent = useMemo(() => {
    switch (activeTab as string) {
      case TABS.GENERAL:
        return (
          <GeneralSettings
            agent={agent}
            settings={settings}
            isLoading={isLoading}
            isUpdating={isUpdating}
            setName={setName}
            saveSettings={saveSettings}
          />
        );
      case TABS.CHAT_INTERFACE:
        return <ChatInterfaceSettings />;
      // Other tab content implementations would go here
      default:
        return (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold">
              {String(activeTab).charAt(0).toUpperCase() + String(activeTab).slice(1).replace(/-/g, " ")}
            </h2>
            <p className="text-muted-foreground mt-2">
              This tab is under development.
            </p>
          </div>
        );
    }
  }, [
    activeTab,
    agent,
    settings,
    isLoading,
    isUpdating,
    setName,
    saveSettings,
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Left sidebar */}
        <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main content */}
        <div className="space-y-8">
          {currentTabContent}

          {activeTab === TABS.GENERAL && (
            <DangerZone
              agent={agent}
              openDeleteDialog={openDeleteDialog}
              openDeleteConversationsDialog={openDeleteConversationsDialog}
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <DeleteAgentDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        agent={agent}
        confirmationText={deleteConfirmationText}
        setConfirmationText={setDeleteConfirmationText}
        onDelete={handleDeleteAgent}
        isDeleting={isDeleting}
      />

      <DeleteConversationsDialog
        isOpen={isDeleteConversationsDialogOpen}
        onClose={closeDeleteConversationsDialog}
        agent={agent}
        onDelete={handleDeleteAllConversations}
        isDeleting={isDeletingConversations}
      />
    </div>
  );
}
