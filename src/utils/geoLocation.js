export const getUserLocation = () => {
  return new Promise((resolve) => {
    console.log("Attempting to get user geolocation");

    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      resolve({});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Geolocation success:", position.coords);
        const { latitude, longitude } = position.coords;

        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )
          .then((response) => {
            console.log("Geocoding response:", response.status);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
          })
          .then((data) => {
            console.log("Geocoding data:", data);
            resolve({
              latitude,
              longitude,
              country: data?.countryName || undefined,
            });
          })
          .catch((error) => {
            console.log("Geocoding failed:", error);
            resolve({ latitude, longitude });
          });
      },
      (error) => {
        console.log("Geolocation denied/failed:", error.code, error.message);
        getIPLocation().then(resolve);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  });
};

const getIPLocation = () => {
  console.log("Attempting IP-based location fallback");

  return fetch("https://ipapi.co/json/")
    .then((res) => {
      console.log("IP geolocation response:", res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      console.log("IP geolocation data:", data);
      if (data?.latitude && data?.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          country: data.country_name,
        };
      }
      throw new Error("Invalid IP location data");
    })
    .catch((err) => {
      console.log("IP fallback failed:", err);

      return fetch("https://freeipapi.com/api/json")
        .then((res) => res.json())
        .then((data) => {
          console.log("Alternative IP data:", data);
          if (data?.latitude && data?.longitude) {
            return {
              latitude: data.latitude,
              longitude: data.longitude,
              country: data.countryName,
            };
          }
          throw new Error("Alternative IP service failed");
        })
        .catch((err2) => {
          console.log("All IP fallbacks failed:", err2);
          return {};
        });
    });
};
