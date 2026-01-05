import { NextResponse } from "next/server";

interface IpStackResponse {
  country_name: string;
  country_code: string;
  location?: {
    languages?: Array<{
      code: string;
      name: string;
    }>;
  };
}

const DEFAULT_RESPONSE = {
  country: "United States",
  countryCode: "US",
  languageCode: "en",
  languageName: "English",
};

export async function GET() {
  const ipstackApiKey = process.env.IPSTACK_API_KEY;

  if (!ipstackApiKey) {
    console.warn("IPSTACK_API_KEY not configured, using default");
    return NextResponse.json(DEFAULT_RESPONSE);
  }

  try {
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
    const language = ipData.location?.languages?.[0];
    
    return NextResponse.json({
      country: countryName,
      countryCode: countryCode,
      languageCode: language?.code || "en",
      languageName: language?.name || "English",
    });
  } catch (error) {
    console.error("Error detecting location:", error);
    return NextResponse.json(DEFAULT_RESPONSE);
  }
}
