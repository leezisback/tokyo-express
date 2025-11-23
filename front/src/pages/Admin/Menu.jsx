// src/pages/Admin/Menu.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    fetchCategories,
    fetchProducts,
    adminCreateCategory,
    adminUpdateCategory,
    adminDeleteCategory,
    adminCreateProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    uploadImage,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext.jsx";

function slugify(value = "") {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-а-яё]/g, "")
        .replace(/-+/g, "-");
}

export default function AdminMenuPage() {
    const { token } = useAuth();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- CATEGORIES FORM ---
    const [catForm, setCatForm] = useState({
        id: null,
        name: "",
        slug: "",
        position: 0,
        isActive: true,
    });
    const [catSaving, setCatSaving] = useState(false);
    const [catError, setCatError] = useState(null);

    // --- PRODUCTS FORM ---
    const [productForm, setProductForm] = useState({
        id: null,
        name: "",
        slug: "",
        category: "",
        description: "",
        composition: "",
        weight: "",
        price: "",
        image: "",
        isAvailable: true,
        isPromotion: false,
        discountPercent: 0,
        position: 0,
    });
    const [prodSaving, setProdSaving] = useState(false);
    const [prodError, setProdError] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // === Загрузка категорий и товаров ===
    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError(null);

                const [cats, prods] = await Promise.all([
                    fetchCategories(),
                    fetchProducts({}),
                ]);

                const normCats = (cats || []).map((c) => ({
                    ...c,
                    id: c._id,
                }));

                const normProds = (prods || []).map((p) => ({
                    ...p,
                    id: p._id,
                }));

                setCategories(normCats);
                setProducts(normProds);
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки категорий и товаров");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const categoriesById = useMemo(() => {
        const map = {};
        for (const c of categories) {
            map[c._id] = c;
        }
        return map;
    }, [categories]);

    // === Работа с формой категорий ===

    const resetCatForm = () => {
        setCatForm({
            id: null,
            name: "",
            slug: "",
            position: 0,
            isActive: true,
        });
        setCatError(null);
    };

    const handleCatChange = (field) => (e) => {
        const value =
            field === "isActive" ? e.target.checked : e.target.value;
        setCatForm((f) => ({
            ...f,
            [field]: field === "position" ? Number(value) || 0 : value,
        }));
    };

    const handleCatEdit = (cat) => {
        setCatForm({
            id: cat._id,
            name: cat.name || "",
            slug: cat.slug || "",
            position: cat.position ?? 0,
            isActive: cat.isActive ?? true,
        });
        setCatError(null);
    };

    const handleCatDelete = async (cat) => {
        if (!token) {
            alert("Нет токена авторизации");
            return;
        }
        if (!window.confirm(`Удалить категорию "${cat.name}"?`)) return;

        try {
            await adminDeleteCategory(cat._id, token);
            setCategories((list) =>
                list.filter((c) => c._id !== cat._id),
            );
        } catch (e) {
            console.error(e);
            alert(e.message || "Ошибка удаления категории");
        }
    };

    const handleCatSubmit = async (e) => {
        e.preventDefault();
        setCatError(null);

        if (!token) {
            setCatError("Нет токена авторизации");
            return;
        }
        if (!catForm.name.trim()) {
            setCatError("Укажите название категории");
            return;
        }

        const slug =
            catForm.slug.trim() || slugify(catForm.name).slice(0, 50);

        const payload = {
            name: catForm.name.trim(),
            slug,
            position: Number(catForm.position) || 0,
            isActive: Boolean(catForm.isActive),
        };

        try {
            setCatSaving(true);

            if (catForm.id) {
                const updated = await adminUpdateCategory(
                    catForm.id,
                    payload,
                    token,
                );
                setCategories((list) =>
                    list.map((c) =>
                        c._id === updated._id ? { ...c, ...updated } : c,
                    ),
                );
            } else {
                const created = await adminCreateCategory(
                    payload,
                    token,
                );
                setCategories((list) => [...list, created]);
            }

            resetCatForm();
        } catch (e) {
            console.error(e);
            setCatError(e.message || "Ошибка сохранения категории");
        } finally {
            setCatSaving(false);
        }
    };

    // === Работа с формой товара ===

    const resetProductForm = () => {
        setProductForm({
            id: null,
            name: "",
            slug: "",
            category: "",
            description: "",
            composition: "",
            weight: "",
            price: "",
            image: "",
            isAvailable: true,
            isPromotion: false,
            discountPercent: 0,
            position: 0,
        });
        setProdError(null);
    };

    const handleProductChange = (field) => (e) => {
        let value;
        if (field === "isAvailable" || field === "isPromotion") {
            value = e.target.checked;
        } else {
            value = e.target.value;
        }

        setProductForm((f) => {
            if (field === "price" || field === "discountPercent" || field === "position") {
                return { ...f, [field]: value }; // как строка, приведём перед отправкой
            }
            return { ...f, [field]: value };
        });
    };

    const handleProductEdit = (p) => {
        setProductForm({
            id: p._id,
            name: p.name || "",
            slug: p.slug || "",
            category: p.category?._id || "",
            description: p.description || "",
            composition: p.composition || "",
            weight: p.weight || "",
            price: p.price != null ? String(p.price) : "",
            image: p.image || "",
            isAvailable: p.isAvailable ?? true,
            isPromotion: p.isPromotion ?? false,
            discountPercent:
                p.discountPercent != null
                    ? String(p.discountPercent)
                    : "0",
            position: p.position != null ? String(p.position) : "0",
        });
        setProdError(null);
    };

    const handleProductDelete = async (p) => {
        if (!token) {
            alert("Нет токена авторизации");
            return;
        }
        if (!window.confirm(`Удалить товар "${p.name}"?`)) return;

        try {
            await adminDeleteProduct(p._id, token);
            setProducts((list) =>
                list.filter((x) => x._id !== p._id),
            );
        } catch (e) {
            console.error(e);
            alert(e.message || "Ошибка удаления товара");
        }
    };

    const handleUploadImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!token) {
            setProdError("Нет токена авторизации");
            return;
        }
        setProdError(null);

        try {
            setUploadingImage(true);
            const data = await uploadImage(file, token);
            // backend возвращает { path, filename }
            setProductForm((f) => ({
                ...f,
                image: data.path || "",
            }));
        } catch (err) {
            console.error(err);
            setProdError(err.message || "Ошибка загрузки изображения");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setProdError(null);

        if (!token) {
            setProdError("Нет токена авторизации");
            return;
        }
        if (!productForm.name.trim()) {
            setProdError("Укажите название товара");
            return;
        }
        if (!productForm.category) {
            setProdError("Выберите категорию товара");
            return;
        }
        if (!productForm.price) {
            setProdError("Укажите цену");
            return;
        }

        const slug =
            productForm.slug.trim() ||
            slugify(productForm.name).slice(0, 60);

        const payload = {
            name: productForm.name.trim(),
            slug,
            category: productForm.category, // ObjectId категории
            description: productForm.description.trim(),
            composition: productForm.composition.trim(),
            weight: productForm.weight.trim(),
            price: Number(productForm.price) || 0,
            image: productForm.image || "",
            isAvailable: Boolean(productForm.isAvailable),
            isPromotion: Boolean(productForm.isPromotion),
            discountPercent: Number(productForm.discountPercent) || 0,
            position: Number(productForm.position) || 0,
        };

        try {
            setProdSaving(true);

            if (productForm.id) {
                const updated = await adminUpdateProduct(
                    productForm.id,
                    payload,
                    token,
                );
                setProducts((list) =>
                    list.map((p) =>
                        p._id === updated._id ? { ...p, ...updated } : p,
                    ),
                );
            } else {
                const created = await adminCreateProduct(
                    payload,
                    token,
                );
                setProducts((list) => [...list, created]);
            }

            resetProductForm();
        } catch (e) {
            console.error(e);
            setProdError(e.message || "Ошибка сохранения товара");
        } finally {
            setProdSaving(false);
        }
    };

    return (
        <section>
            <h2 className="mb-3 text-lg font-semibold">
                Меню ресторана
            </h2>

            {error && (
                <div className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading && (
                <div className="text-sm text-neutral-600 mb-4">
                    Загружаем категории и товары...
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* БЛОК КАТЕГОРИЙ */}
                <div className="rounded-2xl bg-white border shadow-sm p-4">
                    <h3 className="mb-3 text-base font-semibold">
                        Категории
                    </h3>

                    {/* Список категорий */}
                    <div className="mb-4 max-h-64 overflow-auto border rounded-xl">
                        <table className="min-w-full text-xs">
                            <thead>
                            <tr className="bg-neutral-50">
                                <th className="px-2 py-1 text-left">
                                    Название
                                </th>
                                <th className="px-2 py-1 text-left">
                                    slug
                                </th>
                                <th className="px-2 py-1 text-center">
                                    Позиция
                                </th>
                                <th className="px-2 py-1 text-center">
                                    Активна
                                </th>
                                <th className="px-2 py-1" />
                            </tr>
                            </thead>
                            <tbody>
                            {categories.map((c) => (
                                <tr
                                    key={c._id}
                                    className="border-t last:border-b"
                                >
                                    <td className="px-2 py-1">
                                        {c.name}
                                    </td>
                                    <td className="px-2 py-1">
                                        {c.slug}
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                        {c.position ?? 0}
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                        {c.isActive ? "Да" : "Нет"}
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        <button
                                            type="button"
                                            className="mr-1 rounded-full border px-2 py-0.5 text-[11px]"
                                            onClick={() =>
                                                handleCatEdit(c)
                                            }
                                        >
                                            Изм.
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-full border px-2 py-0.5 text-[11px] text-red-600"
                                            onClick={() =>
                                                handleCatDelete(c)
                                            }
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!categories.length && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-2 py-2 text-center text-neutral-500"
                                    >
                                        Нет категорий
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Форма категории */}
                    {catError && (
                        <div className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                            {catError}
                        </div>
                    )}

                    <form
                        onSubmit={handleCatSubmit}
                        className="space-y-2 text-xs"
                    >
                        <div className="grid grid-cols-2 gap-2">
                            <label className="col-span-2">
                                Название
                                <input
                                    className="mt-1 w-full rounded-xl border px-2 py-1"
                                    value={catForm.name}
                                    onChange={handleCatChange("name")}
                                />
                            </label>
                            <label>
                                slug
                                <input
                                    className="mt-1 w-full rounded-xl border px-2 py-1"
                                    value={catForm.slug}
                                    onChange={handleCatChange("slug")}
                                    placeholder="если пусто — сгенерируется"
                                />
                            </label>
                            <label>
                                Позиция
                                <input
                                    type="number"
                                    className="mt-1 w-full rounded-xl border px-2 py-1"
                                    value={catForm.position}
                                    onChange={handleCatChange(
                                        "position",
                                    )}
                                />
                            </label>
                        </div>
                        <label className="flex items-center gap-2 text-xs">
                            <input
                                type="checkbox"
                                checked={catForm.isActive}
                                onChange={handleCatChange("isActive")}
                            />
                            Активная категория
                        </label>

                        <div className="mt-2 flex gap-2">
                            <button
                                type="submit"
                                disabled={catSaving}
                                className="rounded-xl bg-[var(--brand-rose)] px-3 py-1 text-xs font-semibold text-white shadow disabled:opacity-70"
                            >
                                {catForm.id
                                    ? "Сохранить категорию"
                                    : "Добавить категорию"}
                            </button>
                            {catForm.id && (
                                <button
                                    type="button"
                                    className="rounded-xl border px-3 py-1 text-xs"
                                    onClick={resetCatForm}
                                >
                                    Отмена
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* БЛОК ТОВАРОВ */}
                <div className="rounded-2xl bg-white border shadow-sm p-4">
                    <h3 className="mb-3 text-base font-semibold">
                        Товары
                    </h3>

                    {/* Список товаров */}
                    <div className="mb-4 max-h-64 overflow-auto border rounded-xl">
                        <table className="min-w-full text-xs">
                            <thead>
                            <tr className="bg-neutral-50">
                                <th className="px-2 py-1 text-left">
                                    Название
                                </th>
                                <th className="px-2 py-1 text-left">
                                    Категория
                                </th>
                                <th className="px-2 py-1 text-right">
                                    Цена
                                </th>
                                <th className="px-2 py-1 text-center">
                                    В наличии
                                </th>
                                <th className="px-2 py-1" />
                            </tr>
                            </thead>
                            <tbody>
                            {products.map((p) => {
                                const cat =
                                    p.category &&
                                    (typeof p.category === "object"
                                        ? p.category
                                        : categoriesById[
                                            p.category
                                            ]);
                                return (
                                    <tr
                                        key={p._id}
                                        className="border-t last:border-b"
                                    >
                                        <td className="px-2 py-1">
                                            {p.name}
                                        </td>
                                        <td className="px-2 py-1">
                                            {cat?.name || "—"}
                                        </td>
                                        <td className="px-2 py-1 text-right">
                                            {p.price} ₽
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            {p.isAvailable
                                                ? "Да"
                                                : "Нет"}
                                        </td>
                                        <td className="px-2 py-1 text-right">
                                            <button
                                                type="button"
                                                className="mr-1 rounded-full border px-2 py-0.5 text-[11px]"
                                                onClick={() =>
                                                    handleProductEdit(
                                                        p,
                                                    )
                                                }
                                            >
                                                Изм.
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded-full border px-2 py-0.5 text-[11px] text-red-600"
                                                onClick={() =>
                                                    handleProductDelete(
                                                        p,
                                                    )
                                                }
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!products.length && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-2 py-2 text-center text-neutral-500"
                                    >
                                        Нет товаров
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Форма товара */}
                    {prodError && (
                        <div className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                            {prodError}
                        </div>
                    )}

                    <form
                        onSubmit={handleProductSubmit}
                        className="space-y-2 text-xs"
                    >
                        <div className="grid grid-cols-2 gap-2">
                            <label className="col-span-2">
                                Название
                                <input
                                    className="mt-1 w-full rounded-xl border px-2 py-1"
                                    value={productForm.name}
                                    onChange={handleProductChange(
                                        "name",
                                    )}
                                />
                            </label>

                            <label>
                                slug
                                <input
                                    className="mt-1 w-full rounded-xl border px-2 py-1"
                                    value={productForm.slug}
                                    onChange={handleProductChange(
                                        "slug",
                                    )}
                                    placeholder="если пусто — сгенерируется"
                                />
                            </label>

                            <label>
                                Категория
                                <select
                                    className="mt-1 w-full rounded-xl border px-2 py-1"
                                    value={productForm.category}
                                    onChange={handleProductChange(
                                        "category",
                                    )}
                                >
                                    <option value="">
                                        Не выбрана
                                    </option>
                                    {categories.map((c) => (
                                        <option
                                            key={c._id}
                                            value={c._id}
                                        >
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Цена (₽)
                                <input
                                    type="number"
                                    step="1"
                                    className="mt-1 w-full rounded-xl border px-2 py-1"
                                    value={productForm.price}
                                    onChange={handleProductChange(
                                        "price",
                                    )}
                                />
                            </label>

                            <label>
                                Вес
                                <input
                                    className="mt-1 w-full rounded-xl border px-2 py-1"
                                    value={productForm.weight}
                                    onChange={handleProductChange(
                                        "weight",
                                    )}
                                    placeholder="например 245 г"
                                />
                            </label>

                            <label>
                                Позиция
                                <input
                                    type="number"
                                    className="mt-1 w-full rounded-xl border px-2 py-1"
                                    value={productForm.position}
                                    onChange={handleProductChange(
                                        "position",
                                    )}
                                />
                            </label>
                        </div>

                        <label className="block">
                            Описание (кратко)
                            <textarea
                                className="mt-1 w-full rounded-xl border px-2 py-1"
                                rows={2}
                                value={productForm.description}
                                onChange={handleProductChange(
                                    "description",
                                )}
                            />
                        </label>

                        <label className="block">
                            Состав (для модалки)
                            <textarea
                                className="mt-1 w-full rounded-xl border px-2 py-1"
                                rows={2}
                                value={productForm.composition}
                                onChange={handleProductChange(
                                    "composition",
                                )}
                            />
                        </label>

                        {/* Загрузка фото */}
                        <div className="grid grid-cols-[1.5fr_minmax(0,1fr)] gap-3 items-start">
                            <label className="block">
                                Фото товара
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="mt-1 w-full text-xs"
                                    onChange={handleUploadImage}
                                    disabled={uploadingImage}
                                />
                                {uploadingImage && (
                                    <div className="mt-1 text-[11px] text-neutral-600">
                                        Загрузка изображения...
                                    </div>
                                )}
                                {productForm.image && (
                                    <div className="mt-1 text-[11px] text-neutral-600 break-all">
                                        Путь: {productForm.image}
                                    </div>
                                )}
                            </label>

                            <div className="rounded-xl border bg-neutral-50 p-2">
                                <div className="mb-1 text-[11px] text-neutral-600">
                                    Превью:
                                </div>
                                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-white grid place-items-center">
                                    {productForm.image ? (
                                        <img
                                            src={productForm.image}
                                            alt={productForm.name}
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-[10px] text-neutral-400">
                                            Нет изображения
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-1">
                            <label className="flex items-center gap-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={productForm.isAvailable}
                                    onChange={handleProductChange(
                                        "isAvailable",
                                    )}
                                />
                                В наличии
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={productForm.isPromotion}
                                    onChange={handleProductChange(
                                        "isPromotion",
                                    )}
                                />
                                Акционный товар
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                                Скидка, %
                                <input
                                    type="number"
                                    className="w-16 rounded-xl border px-2 py-1 text-xs"
                                    value={productForm.discountPercent}
                                    onChange={handleProductChange(
                                        "discountPercent",
                                    )}
                                />
                            </label>
                        </div>

                        <div className="mt-3 flex gap-2">
                            <button
                                type="submit"
                                disabled={prodSaving}
                                className="rounded-xl bg-[var(--brand-rose)] px-3 py-1 text-xs font-semibold text-white shadow disabled:opacity-70"
                            >
                                {productForm.id
                                    ? "Сохранить товар"
                                    : "Добавить товар"}
                            </button>
                            {productForm.id && (
                                <button
                                    type="button"
                                    className="rounded-xl border px-3 py-1 text-xs"
                                    onClick={resetProductForm}
                                >
                                    Отмена
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
