import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import AdminLayout from "../../../layouts/AdminLayout";
import RichTextEditor from "../../../components/editor/RichTextEditor";
import {
  getAdminPostById,
  getAdminPostCategories,
  updateAdminPost,
} from "../../../services/newsAdminService";
import axiosClient from "../../../api/axiosClient";
import {
  applyImageFallback,
  resolveImageUrl,
} from "../../../utils/imageFallback";

const emptyFormData = {
  title: "",
  slug: "",
  summary: "",
  contentHtml: "",
  thumbnailUrl: "",
  categoryId: "",
  status: "DRAFT",
  isFeatured: false,
  publishedAt: "",
  metaTitle: "",
  metaDescription: "",
};

const generateSlug = (text) =>
  text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

export default function AdminPostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialSlug, setInitialSlug] = useState("");
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const [categoriesRes, postRes] = await Promise.all([
          getAdminPostCategories({ size: 100 }),
          getAdminPostById(id),
        ]);

        setCategories(categoriesRes.data.content || []);

        const post = postRes.data;
        setInitialSlug(post.slug || "");
        setFormData({
          title: post.title || "",
          slug: post.slug || "",
          summary: post.summary || "",
          contentHtml: post.contentHtml || "",
          thumbnailUrl: post.thumbnailUrl || "",
          categoryId: post.categoryId || "",
          status: post.status || "DRAFT",
          isFeatured: Boolean(post.isFeatured),
          publishedAt: post.publishedAt ? post.publishedAt.substring(0, 16) : "",
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
        });
      } catch (error) {
        console.error("Error loading post", error);
        toast.error("Khong the tai thong tin bai viet.");
        navigate("/admin/posts");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleTitleChange = (e) => {
    const title = e.target.value;

    setFormData((prev) => ({
      ...prev,
      title,
      slug:
        !prev.slug || prev.slug === initialSlug ? generateSlug(title) : prev.slug,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditorChange = (contentHtml) => {
    setFormData((prev) => ({ ...prev, contentHtml }));
  };

  const handleThumbnailUrlChange = (e) => {
    setFormData((prev) => ({ ...prev, thumbnailUrl: e.target.value }));
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const data = new FormData();
    data.append("file", file);

    setUploadingThumbnail(true);

    try {
      const res = await axiosClient.post("/api/admin/media/images", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData((prev) => ({ ...prev, thumbnailUrl: res.data.url || "" }));
      toast.success("Tai anh len thanh cong.");
    } catch (error) {
      console.error("Thumbnail upload failed", error);
      toast.error(
        error.response?.data?.message || "Khong the tai anh len."
      );
    } finally {
      setUploadingThumbnail(false);
      e.target.value = "";
    }
  };

  const removeThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnailUrl: "" }));
  };

  const submitForm = async (status) => {
    if (!formData.title.trim()) {
      return toast.error("Vui long nhap tieu de bai viet.");
    }

    if (!formData.slug.trim()) {
      return toast.error("Duong dan slug la bat buoc.");
    }

    if (!formData.categoryId) {
      return toast.error("Vui long chon chuyen muc.");
    }

    if (status === "PUBLISHED" && !formData.contentHtml.trim()) {
      return toast.error("Vui long nhap noi dung bai viet.");
    }

    setSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        summary: formData.summary.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim(),
        metaTitle: formData.metaTitle.trim(),
        metaDescription: formData.metaDescription.trim(),
        status,
      };

      if (status === "PUBLISHED" && !dataToSubmit.publishedAt) {
        dataToSubmit.publishedAt = new Date().toISOString();
      }

      await updateAdminPost(id, dataToSubmit);
      toast.success("Cap nhat bai viet thanh cong.");
      navigate("/admin/posts");
    } catch (error) {
      if (
        error.response?.data?.message === "POST_SLUG_ALREADY_EXISTS" ||
        error.response?.data === "POST_SLUG_ALREADY_EXISTS"
      ) {
        toast.error("Slug bai viet da ton tai. Vui long dung slug khac.");
      } else {
        console.error("Update post failed", error);
        toast.error("Khong the cap nhat bai viet.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">Dang tai du lieu...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Sua bai viet</h2>
        <Link to="/admin/posts" className="btn btn-outline-secondary">
          <i className="fa-solid fa-arrow-left me-2"></i>
          Quay lai
        </Link>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Tieu de bai viet <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhap tieu de..."
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Duong dan (Slug) <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                />
                {formData.slug !== initialSlug && (
                  <small className="text-warning">
                    Thay doi slug co the anh huong den SEO neu bai viet da duoc
                    index.
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Mo ta ngan</label>
                <textarea
                  className="form-control"
                  rows="3"
                  maxLength={500}
                  placeholder="Tom tat noi dung bai viet..."
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                ></textarea>
                <div className="text-end text-muted small">
                  {formData.summary.length}/500 ky tu
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Noi dung chi tiet <span className="text-danger">*</span>
                </label>
                <RichTextEditor
                  value={formData.contentHtml}
                  onChange={handleEditorChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Meta Title (SEO)</label>
                <input
                  type="text"
                  className="form-control"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Meta Description (SEO)
                </label>
                <textarea
                  className="form-control"
                  rows="2"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white fw-bold">
              Thong tin bai viet
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Chuyen muc <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                >
                  <option value="">-- Chon chuyen muc --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Anh dai dien</label>

                <div className="border border-dashed p-4 text-center rounded bg-light mb-3">
                  <i className="fa-solid fa-cloud-arrow-up fs-2 text-muted mb-2"></i>
                  <p className="mb-2 small">Tai anh tu may tinh</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control form-control-sm"
                    onChange={handleThumbnailChange}
                    disabled={uploadingThumbnail}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Hoac dan URL anh
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/thumbnail.jpg"
                    value={formData.thumbnailUrl}
                    onChange={handleThumbnailUrlChange}
                  />
                </div>

                {formData.thumbnailUrl && (
                  <div className="position-relative mb-2 text-center border p-2 rounded">
                    <img
                      src={resolveImageUrl(formData.thumbnailUrl)}
                      alt="Thumbnail"
                      className="img-fluid rounded"
                      style={{ maxHeight: "220px" }}
                      onError={(e) => applyImageFallback(e)}
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                      onClick={removeThumbnail}
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                )}

                <small className="text-muted d-block mt-1">
                  Ban co the tai file anh hoac dan URL anh. Kich thuoc goi y:
                  1200 x 675px, toi da 5MB.
                </small>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  <label className="form-check-label fw-bold" htmlFor="isFeatured">
                    Noi bat tren trang chu
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Trang thai hien tai</label>
                <div className="mb-2">
                  {formData.status === "PUBLISHED" && (
                    <span className="badge bg-success">Da dang</span>
                  )}
                  {formData.status === "DRAFT" && (
                    <span className="badge bg-warning text-dark">Ban nhap</span>
                  )}
                  {formData.status === "HIDDEN" && (
                    <span className="badge bg-secondary">Da an</span>
                  )}
                </div>

                <label className="form-label fw-bold mt-2">
                  Ngay dang (tuy chon)
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="publishedAt"
                  value={formData.publishedAt}
                  onChange={handleChange}
                />
              </div>

              <hr />

              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => submitForm(formData.status)}
                  disabled={submitting}
                >
                  {submitting ? (
                    "Dang xu ly..."
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk me-2"></i>
                      Cap nhat bai viet
                    </>
                  )}
                </button>

                {formData.status !== "PUBLISHED" && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => submitForm("PUBLISHED")}
                    disabled={submitting}
                  >
                    <i className="fa-solid fa-paper-plane me-2"></i>
                    Dang bai viet
                  </button>
                )}

                <Link to={`/admin/posts/${id}/preview`} className="btn btn-outline-info">
                  <i className="fa-solid fa-eye me-2"></i>
                  Xem truoc
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
