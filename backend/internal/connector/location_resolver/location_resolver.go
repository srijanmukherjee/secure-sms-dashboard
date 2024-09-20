package location_resolver

import (
	"backend/internal/config"
	"backend/internal/model"
	"encoding/json"
	"fmt"
	"net/http"
)

func ResolveIPLocation(ip string) (model.IPLocation, error) {
	response, err := http.Get(fmt.Sprintf("%s/json/%s", config.IP_API_ENDPOINT, ip))
	if err != nil {
		return model.IPLocation{}, err
	}

	ipLocation := model.IPLocation{}
	err = json.NewDecoder(response.Body).Decode(&ipLocation)
	if err != nil {
		return model.IPLocation{}, err
	}

	return ipLocation, err
}
