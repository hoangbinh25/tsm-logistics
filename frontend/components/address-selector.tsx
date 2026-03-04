"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface AddressSelectorProps {
    province: string
    district: string
    ward: string
    onProvinceChange: (value: string) => void
    onDistrictChange: (value: string) => void
    onWardChange: (value: string) => void
    className?: string
}

export function AddressSelector({
    province,
    district,
    ward,
    onProvinceChange,
    onDistrictChange,
    onWardChange,
    className
}: AddressSelectorProps) {
    const [provinces, setProvinces] = useState<any[]>([])
    const [districts, setDistricts] = useState<any[]>([])
    const [wards, setWards] = useState<any[]>([])

    const [openProvince, setOpenProvince] = useState(false)
    const [openDistrict, setOpenDistrict] = useState(false)
    const [openWard, setOpenWard] = useState(false)

    // Fetch Provinces
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/p/")
            .then(res => res.json())
            .then(data => setProvinces(data))
            .catch(err => console.error("Lỗi fetch tỉnh:", err))
    }, [])

    // Fetch Districts when province changes
    useEffect(() => {
        if (!province) {
            setDistricts([])
            return
        }
        const provinceCode = provinces.find(p => p.name === province)?.code
        if (provinceCode) {
            fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
                .then(res => res.json())
                .then(data => setDistricts(data.districts))
                .catch(err => console.error("Lỗi fetch huyện:", err))
        }
    }, [province, provinces])

    // Fetch Wards when district changes
    useEffect(() => {
        if (!district) {
            setWards([])
            return
        }
        const districtCode = districts.find(d => d.name === district)?.code
        if (districtCode) {
            fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
                .then(res => res.json())
                .then(data => setWards(data.wards))
                .catch(err => console.error("Lỗi fetch xã:", err))
        }
    }, [district, districts])

    return (
        <div className={cn("grid grid-cols-3 gap-4", className)}>
            {/* Province */}
            <div className="space-y-2 flex flex-col">
                <Label className="mb-2">Tỉnh / Thành</Label>
                <Popover open={openProvince} onOpenChange={setOpenProvince}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openProvince}
                            className="justify-between font-normal h-10 overflow-hidden"
                        >
                            {province || "Chọn Tỉnh..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandInput placeholder="Tìm tỉnh..." />
                            <CommandList>
                                <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                <CommandGroup>
                                    {provinces.map((p) => (
                                        <CommandItem
                                            key={p.code}
                                            value={p.name}
                                            onSelect={() => {
                                                onProvinceChange(p.name)
                                                setOpenProvince(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    province === p.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {p.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* District */}
            <div className="space-y-2 flex flex-col">
                <Label className="mb-2">Quận / Huyện</Label>
                <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openDistrict}
                            className="justify-between font-normal h-10 overflow-hidden"
                            disabled={!province}
                        >
                            {district || "Chọn Huyện..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandInput placeholder="Tìm huyện..." />
                            <CommandList>
                                <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                <CommandGroup>
                                    {districts.map((d) => (
                                        <CommandItem
                                            key={d.code}
                                            value={d.name}
                                            onSelect={() => {
                                                onDistrictChange(d.name)
                                                setOpenDistrict(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    district === d.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {d.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Ward */}
            <div className="space-y-2 flex flex-col">
                <Label className="mb-2">Phường / Xã</Label>
                <Popover open={openWard} onOpenChange={setOpenWard}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openWard}
                            className="justify-between font-normal h-10 overflow-hidden"
                            disabled={!district}
                        >
                            {ward || "Chọn Xã..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandInput placeholder="Tìm xã..." />
                            <CommandList>
                                <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                <CommandGroup>
                                    {wards.map((w) => (
                                        <CommandItem
                                            key={w.code}
                                            value={w.name}
                                            onSelect={() => {
                                                onWardChange(w.name)
                                                setOpenWard(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    ward === w.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {w.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
