import { useNavigate } from "react-router-dom";
import { artworks, type ArtworkKind } from "../data/artworks";
import { useLab } from "../state/LabContext";
import { Modal } from "./Modal";
import { Icon } from "./Icon";

export function CollectionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { saved, favorites, restoreExperiment, deleteExperiment } = useLab();
  const navigate = useNavigate();
  const visit = (kind: ArtworkKind) => {
    onClose();
    navigate("/experiment/" + kind);
  };
  return (
    <Modal
      open={open}
      title="我的收藏"
      onClose={onClose}
      className="collection-modal"
    >
      <p className="muted">属于你的形态，留在这台设备。</p>
      <h3 className="mini-heading">收藏的作品 · {favorites.length}</h3>
      {favorites.length === 0 ? (
        <p className="empty-state">
          在作品页点一下爱心，把喜欢的作品留在这里。
        </p>
      ) : (
        <div className="favorite-list">
          {artworks
            .filter((art) => favorites.includes(art.kind))
            .map((art) => (
              <button key={art.kind} onClick={() => visit(art.kind)}>
                <span>
                  {art.number} / {art.title}
                </span>
                <Icon name="arrow" />
              </button>
            ))}
        </div>
      )}
      <h3 className="mini-heading">保存的实验 · {saved.length}</h3>
      {saved.length === 0 ? (
        <p className="empty-state">
          调整颜色、细节或速度，再点击“收藏实验”，保存你的第一个版本。
        </p>
      ) : (
        <div className="saved-list">
          {saved.map((item) => (
            <div className="saved-item" key={item.id}>
              <span
                className="saved-swatch"
                style={{ background: item.settings.color }}
              />
              <button
                className="saved-item__open"
                onClick={() => {
                  restoreExperiment(item.id);
                  visit(item.kind);
                }}
              >
                <strong>{item.title}</strong>
                <span>
                  {artworks.find((art) => art.kind === item.kind)?.title} ·{" "}
                  {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </button>
              <button
                className="icon-button"
                aria-label={"删除实验 " + item.title}
                onClick={() => deleteExperiment(item.id)}
              >
                <Icon name="trash" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
