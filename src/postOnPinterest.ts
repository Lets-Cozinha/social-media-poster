export const postOnPinterest = async () => {
  const getPins = await fetch('https://api.pinterest.com/v5/pins', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer pinc_AEASZ5IWAAAAAAAAAAAAAABM6JCWDEQBACGSOJZWH27TYXJD3KQUNIPNFC3XINV6S7BTHWNLZAJLSNGLGBJ7TV52VGMIZLIA`,
    },
  }).then((response) => {
    return response.json();
  });

  console.log(getPins);

  /**
   * https://developers.pinterest.com/docs/api/v5/pins-create
   */
  const response = await fetch('https://api.pinterest.com/v5/pins', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer pinc_AEASZ5IWAAAAAAAAAAAAAADUEQ2GDEQBACGSPEP6E7GM5DDR3IZS47MHVBYMJDDZGXXYXOHPTTKQM7A6T53KQSDOFF6Q2UIA`,
    },
    body: JSON.stringify({
      title: 'My Pin',
      description: 'Pin Description',
      // board_id: '989384680578050054',
      media_source: {
        source_type: 'image_url',
        url: 'https://i.pinimg.com/564x/28/75/e9/2875e94f8055227e72d514b837adb271.jpg',
      },
    }),
  }).then((response) => {
    return response.json();
  });

  console.log(response);
};

postOnPinterest();
