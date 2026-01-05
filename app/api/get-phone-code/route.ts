import { NextResponse } from "next/server";

interface IpStackResponse {
  country_name: string;
  country_code: string;
  ip: string;
}

interface RestCountryResponse {
  idd?: {
    root?: string;
    suffixes?: string[];
  };
}

const DEFAULT_RESPONSE = {
  country: "United States",
  countryCode: "US",
  dialCode: "+1",
};

export async function GET() {
  const ipstackApiKey = process.env.IPSTACK_API_KEY;

  if (!ipstackApiKey) {
    console.warn("IPSTACK_API_KEY not configured, using default country");
    return NextResponse.json(DEFAULT_RESPONSE);
  }

  try {
    // Step 1: Get user's IP and country from ipstack
    const ipstackRes = await fetch(
      `http://api.ipstack.com/check?access_key=${ipstackApiKey}`,
      { cache: "no-store" }
    );

    if (!ipstackRes.ok) {
      throw new Error("Failed to fetch from ipstack");
    }

    const ipData: IpStackResponse = await ipstackRes.json();
    const countryCode = ipData.country_code || "US";
    const countryName = ipData.country_name || "United States";

    // Step 2: Get dial code from REST Countries API
    const restCountriesRes = await fetch(
      `https://restcountries.com/v3.1/alpha/${countryCode}?fields=idd`,
      { cache: "force-cache" }
    );

    let dialCode = "+1"; // Default to US

    if (restCountriesRes.ok) {
      const countryData: RestCountryResponse = await restCountriesRes.json();
      if (countryData.idd?.root) {
        const suffix = countryData.idd.suffixes?.[0] || "";
        dialCode = `${countryData.idd.root}${suffix}`;
      }
    }

    return NextResponse.json({
      country: countryName,
      countryCode: countryCode,
      dialCode: dialCode,
    });
  } catch (error) {
    console.error("Error detecting location:", error);
    return NextResponse.json(DEFAULT_RESPONSE);
  }
}
