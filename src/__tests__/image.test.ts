import { createImageFile, appendImageToForm } from "../utils/image";

describe("createImageFile", () => {
  it("infers name and type from a simple file:// URI", () => {
    const file = createImageFile("file:///data/photo.jpg");
    expect(file).toEqual({
      uri: "file:///data/photo.jpg",
      type: "image/jpeg",
      name: "photo.jpg",
    });
  });

  it("infers png MIME type", () => {
    const file = createImageFile("file:///data/screenshot.png");
    expect(file.type).toBe("image/png");
  });

  it("infers webp MIME type", () => {
    const file = createImageFile("file:///data/image.webp");
    expect(file.type).toBe("image/webp");
  });

  it("defaults to image/jpeg for unknown extensions", () => {
    const file = createImageFile("file:///data/image.bmp");
    expect(file.type).toBe("image/jpeg");
  });

  it("strips query parameters from the inferred name", () => {
    const file = createImageFile(
      "content://media/photo.jpg?width=100&height=100",
    );
    expect(file.name).toBe("photo.jpg");
  });

  it("uses provided name and type overrides", () => {
    const file = createImageFile(
      "file:///data/photo.jpg",
      "custom.png",
      "image/png",
    );
    expect(file).toEqual({
      uri: "file:///data/photo.jpg",
      type: "image/png",
      name: "custom.png",
    });
  });

  it("falls back to photo.jpg when URI has no recognisable filename", () => {
    const file = createImageFile("");
    expect(file.name).toBe("photo.jpg");
  });
});

describe("appendImageToForm", () => {
  it("appends the file object to FormData", () => {
    const formData = new FormData();
    const file = createImageFile("file:///data/photo.jpg");

    appendImageToForm(formData, "imgupload_front", file);

    // Node's FormData (used in tests) stores the value; we can at
    // least verify the append didn't throw and the field exists.
    const value = formData.get("imgupload_front");
    expect(value).toBeTruthy();
  });
});
