from datetime import datetime
from enum import Enum
from typing import Any, Self

from pydantic import UUID4, BaseModel, Field, model_validator


class MediaType(str, Enum):
    IMAGE = 'image'
    AUDIO = 'audio'


class MediaLicense(str, Enum):
    BY = 'by'
    BY_NC = 'by-nc'
    BY_NC_ND = 'by-nc-nd'
    BY_NC_SA = 'by-nc-sa'
    BY_ND = 'by-nd'
    BY_SA = 'by-sa'
    CC0 = 'cc0'
    NC_SAMPLING_PLUS = 'nc-sampling+'
    PDM = 'pdm'
    SAMPLING_PLUS = 'sampling+'


class MediaLicenseType(str, Enum):
    ALL = 'all'
    ALL_CC = 'all-cc'
    COMMERCIAL = 'commercial'
    MODIFICATION = 'modification'


class ImageCategory(str, Enum):
    DIGITIZED_ARTWORK = 'digitized_artwork'
    ILLUSTRATION = 'illustration'
    PHOTOGRAPH = 'photograph'


class AudioCategory(str, Enum):
    AUDIOBOOK = 'audiobook'
    MUSIC = 'music'
    NEWS = 'news'
    PODCAST = 'podcast'
    PRONUNCIATION = 'pronunciation'
    SOUND_EFFECT = 'sound_effect'


class ImageAspectRatio(str, Enum):
    SQUARE = 'square'
    TALL = 'tall'
    WIDE = 'wide'


class ImageSize(str, Enum):
    LARGE = 'large'
    MEDIUM = 'medium'
    SMALL = 'small'


class AudioLength(str, Enum):
    LONG = 'long'
    MEDIUM = 'medium'
    SHORT = 'short'
    SHORTEST = 'shortest'


class MediaSearchParams(BaseModel):
    type: MediaType
    q: str = Field('', max_length=200)
    page: int | None = Field(None, ge=1)
    page_size: int | None = Field(None, ge=1)
    license: set[MediaLicense] | None = None
    license_type: set[MediaLicenseType] | None = None
    categories: set[ImageCategory] | set[AudioCategory] | None = None
    aspect_ratio: set[ImageAspectRatio] | None = None
    size: set[ImageSize] | None = None
    length: set[AudioLength] | None = None

    @model_validator(mode='after')
    def validate_type(self) -> Self:
        if self.type == MediaType.IMAGE:
            if self.categories is not None and not all(
                isinstance(cat, ImageCategory) for cat in self.categories
            ):
                raise ValueError('Only image categories are allowed for type=image')

            if self.length is not None:
                raise ValueError('length is not allowed for type=image')

        if self.type == MediaType.AUDIO:
            if self.categories is not None and not all(
                isinstance(cat, AudioCategory) for cat in self.categories
            ):
                raise ValueError('Only audio categories are allowed for type=audio')

            if self.size is not None:
                raise ValueError('size is not allowed for type=audio')

            if self.aspect_ratio is not None:
                raise ValueError('aspect_ratio is not allowed for type=audio')

        return self


class MediaDetailParams(BaseModel):
    type: MediaType
    id: UUID4


class MediaTag(BaseModel):
    accuracy: float | None
    name: str
    unstable__provider: str | None


class ImageSearchItem(BaseModel):
    id: str
    title: str | None
    indexed_on: datetime
    foreign_landing_url: str | None
    url: str | None
    creator: str | None
    creator_url: str | None
    license: str
    license_version: str | None
    license_url: str | None
    provider: str | None
    source: str | None
    category: str | None
    filesize: int | None
    filetype: str | None
    tags: list[MediaTag] | None
    attribution: str | None
    fields_matched: list[str] | None
    mature: bool
    height: int | None
    width: int | None
    thumbnail: str
    detail_url: str
    related_url: str


class ImageSearchResponse(BaseModel):
    result_count: int
    page_count: int
    page_size: int
    page: int
    results: list[ImageSearchItem]
    warnings: list[dict[str, Any]] | None = None


class AudioAltFile(BaseModel):
    url: str
    bit_rate: int
    filesize: int
    filetype: str
    sample_rate: int


class AudioSet(BaseModel):
    title: str | None
    foreign_landing_url: str | None
    creator: str | None
    creator_url: str | None
    url: str | None
    filesize: int | None
    filetype: str | None


class AudioSearchItem(BaseModel):
    id: str
    title: str | None
    indexed_on: datetime
    foreign_landing_url: str | None
    url: str | None
    creator: str | None
    creator_url: str | None
    license: str
    license_version: str | None
    license_url: str | None
    provider: str | None
    source: str | None
    category: str | None
    genres: list[str] | None
    filesize: int | None
    filetype: str | None
    tags: list[MediaTag] | None
    alt_files: list[AudioAltFile] | None
    attribution: str | None
    fields_matched: list[str] | None
    mature: bool
    audio_set: AudioSet | None
    duration: int | None
    bit_rate: int | None
    sample_rate: int | None
    thumbnail: str | None
    detail_url: str
    related_url: str
    waveform: str


class AudioSearchResponse(BaseModel):
    result_count: int
    page_count: int
    page_size: int
    page: int
    results: list[AudioSearchItem]
    warnings: list[dict[str, Any]] | None = None
