import Image from "next/image";
import React, { useState } from "react";
import {
  useDeleteAdvertisementMutation,
  useSetPrimaryAdvertisementMutation,
} from "@/query-options/advertisements-query-options";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useTranslation } from "@/contexts/i18n-context";
import { useToast } from "@/hooks/useToast";

function Advertisement({
  advertisement,
}: {
  advertisement: Advertisement.Advertisement;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const deleteAdvertisementMutation = useDeleteAdvertisementMutation();
  const setPrimaryAdvertisementMutation = useSetPrimaryAdvertisementMutation();

  const handleDeleteClick = () => {
    if (
      deleteAdvertisementMutation.isPending ||
      setPrimaryAdvertisementMutation.isPending
    ) {
      return; // Prevent action if any mutation is pending
    }
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    const id = advertisement.id;
    deleteAdvertisementMutation.mutate(id, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: t('advertisements.deleteSuccess'),
          duration: 3000,
        });
        setShowDeleteConfirm(false);
      },
      onError: () => {
        showToast({
          type: "error",
          title: t('advertisements.deleteError'),
          duration: 5000,
        });
        setShowDeleteConfirm(false);
      },
    });
  };

  const setPrimaryAdvertisement = () => {
    if (
      deleteAdvertisementMutation.isPending ||
      setPrimaryAdvertisementMutation.isPending
    ) {
      return; // Prevent action if any mutation is pending
    }
    const id = advertisement.id;
    setPrimaryAdvertisementMutation.mutate(id, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: t('advertisements.setPrimarySuccess'),
          duration: 3000,
        });
      },
      onError: () => {
        showToast({
          type: "error",
          title: t('advertisements.setPrimaryError'),
          duration: 5000,
        });
      },
    });
  };

  const isAnyMutationPending =
    deleteAdvertisementMutation.isPending ||
    setPrimaryAdvertisementMutation.isPending;

  return (
    <div>
      <div className="w-full max-w-[375px] overflow-hidden rounded-lg shadow-md relative aspect-[5/2]">
        <Image
          src={advertisement.image_url}
          alt={"Advertisement"}
          fill
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute bottom-0 right-0 p-2 flex items-center gap-2">
          {advertisement.display_order == 0 ? (
            <div className="bg-[#E9F1FF] rounded px-2 py-0.5 flex items-center gap-1 cursor-pointer">
              <Image
                src="/images/primary-star.svg"
                alt="Primary"
                width={12}
                height={12}
              />
              <span className="text-xs text-[#2970FF]">Primary</span>
            </div>
          ) : (
            <div
              onClick={setPrimaryAdvertisement}
              className={`bg-[#E9F1FF] rounded px-2 py-0.5 flex items-center gap-1 transition-colors ${
                isAnyMutationPending
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-[#d6e7ff]"
              }`}
            >
              <Image
                src="/images/star.svg"
                alt="Primary"
                width={12}
                height={12}
              />
              <span className="text-xs text-[#2970FF]">
                {setPrimaryAdvertisementMutation.isPending
                  ? "Setting..."
                  : "Set as Primary"}
              </span>
            </div>
          )}
          <div
            onClick={handleDeleteClick}
            className={`bg-white h-[20px] w-[20px] rounded-sm flex items-center justify-center transition-colors ${
              isAnyMutationPending
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-red-50"
            }`}
            title={
              deleteAdvertisementMutation.isPending
                ? "Deleting..."
                : "Delete advertisement"
            }
          >
            {deleteAdvertisementMutation.isPending ? (
              <div className="w-3 h-3 border border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
            ) : (
              <Image
                src="/images/trash-icon.svg"
                alt="Trash"
                width={12}
                height={12}
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t('advertisements.deleteConfirmTitle')}
        description={t('advertisements.deleteConfirmDescription')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteAdvertisementMutation.isPending}
      />
    </div>
  );
}

export default Advertisement;
