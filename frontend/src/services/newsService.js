// Mock service for News/Blog
// TODO: Replace with real API calls when backend is ready

export const getNews = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            id: 1,
            title: "Top 10 món đồ chơi phát triển trí tuệ cho bé",
            shortDescription: "Khám phá những món đồ chơi giúp bé phát triển tư duy, sáng tạo và kỹ năng toàn diện.",
            imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500",
            publishedDate: "2026-06-20",
            slug: "top-10-do-choi-tri-tue"
          },
          {
            id: 2,
            title: "Cách chọn thú bông an toàn cho bé yêu",
            shortDescription: "Tư vấn cách chọn thú bông chất lượng, an toàn và phù hợp với từng độ tuổi của bé.",
            imageUrl: "https://images.unsplash.com/photo-1559251606-c623743a6d76?w=500",
            publishedDate: "2026-06-18",
            slug: "cach-chon-thu-bong-an-toan"
          },
          {
            id: 3,
            title: "Hoạt động ngoài trời thú vị cho ngày hè",
            shortDescription: "Gợi ý các trò chơi ngoài trời giúp bé năng động và gắn kết với gia đình.",
            imageUrl: "https://images.unsplash.com/photo-1596443686812-2f45229eebc3?w=500",
            publishedDate: "2026-06-15",
            slug: "hoat-dong-ngoai-troi-ngay-he"
          }
        ]
      });
    }, 400); // simulate network delay
  });
};
